const e = require("express");
const express = require("express");
const fs = require("fs");

const router = express.Router();
let carRecord = require("../cars.json");
let slotRecord = require("../slots.json");
const validator = require("express-jsonschema").validate;
const carSchema = require("../models/cars");

const { lotSize } = require("../config");

const save = () => {
  fs.writeFile("./cars.json", JSON.stringify(carRecord, null, 2), (error) => {
    if (error) {
      throw error;
    }
  });
};

class TokenBucket {
  constructor(capacity, perSecond) {
    this.capacity = capacity;
    this.tokens = capacity;
    setInterval(() => this.addToken(), 1000 / perSecond);
  }

  addToken() {
    if (this.tokens < this.capacity) {
      this.tokens += 1;
    }
  }

  take() {
    if (this.tokens > 0) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }
}

function limitRequests(maxReq, perSecond) {
  const buckets = new Map();

  // Return an Express middleware function
  return function limitRequestsMiddleware(req, res, next) {
    if (!buckets.has(req.ip)) {
      buckets.set(req.ip, new TokenBucket(maxReq, perSecond));
    }

    const bucketForIP = buckets.get(req.ip);
    if (bucketForIP.take()) {
      next();
    } else {
      res.status(429).send("Client rate limit exceeded");
    }
  };
}
router.post(
  "/",
  limitRequests(1, 1),
  validator({ body: carSchema }),
  async (req, res) => {
    try {
      if (Number(lotSize) < carRecord.length) {
        res.status(409).send({ message: "Parking lot full" });
      } else {
        if (carRecord.find((car) => car.id == req.body.id)) {
          res.status(409).send({ message: "Car ID already exists" });
        } else {
          carRecord.push(req.body);
          save();

          return res.status(201).json({
            message: `Car successfully parked in slot ${req.body.slotId} `,
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("something went wrong, error adding car to slot");
    }
  }
);

// A route that returns information of a car and the slot it is parked in
router.get("/:id/:slot", limitRequests(1, 1), async (req, res) => {
  try {
    const carDetails = carRecord.find((car) => car.id === req.params.id);
    const slotDetails = slotRecord.find((slot) => slot.id === req.params.slot);

    if (!carDetails) {
      res
        .status(404)
        .send({ message: "Car with such Id was not found, enter correct ID" });
    } else {
      res.status(200).json({ carDetails, slotDetails });
    }
  } catch (err) {
    console.log(err);
    res.json({ message: err });
  }
});

// unparking a car
router.delete("/:id", limitRequests(1, 1), async (req, res) => {
  try {
    if (carRecord.find((car) => car.id === req.params.id)) {
      carRecord = carRecord.filter((car) => car.id !== req.params.id);
      save();
      res.status(200).json({
        message: "Car Unparked successfully",
        status: "success",
        removed: req.params.id,
        newLength: carRecord.length,
      });
    } else {
      res
        .status(404)
        .send({ message: "Car you are trying to unpark does not exist" });
    }
  } catch (err) {
    console.log(err);
    res.json({ message: err });
  }
});

module.exports = router;
