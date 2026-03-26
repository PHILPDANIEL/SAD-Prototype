const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  day: String,
  totalSales: Number,
  ordersCount: Number
})

module.exports = mongoose.model("Sales", schema)