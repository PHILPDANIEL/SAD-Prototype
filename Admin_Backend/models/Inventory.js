const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  productId: Number,
  productName: String,
  stockIn: Number,
  stockOut: Number,
  remainingStock: Number,
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Inventory", schema)