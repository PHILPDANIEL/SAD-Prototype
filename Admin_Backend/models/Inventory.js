const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  productName: String,
  stockIn: Number,
  stockOut: Number,
  remainingStock: Number,
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Inventory", schema)