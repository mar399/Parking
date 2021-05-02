const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const carsRoute = require("./routes/car");

const port = process.env.PORT || 3000;
require("dotenv").config();

// var cars = fs.readFileSync("cars.json");
let carRecord = require("./cars.json");

app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
// const port = 3000;

//Import routes

// users route
app.use("/car", carsRoute);

const save = () => {
  fs.writeFile("./cars.json", JSON.stringify(carRecord, null, 2), (error) => {
    if (error) {
      throw error;
    }
  });
};

app.listen(3000, () => console.log("Server is running"));
