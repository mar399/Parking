const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  lotSize: process.env.parkingLotSize,
};
