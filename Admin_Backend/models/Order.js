const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  orderId: Number,
  customerName: String,
  products: [
    {
      productId: Number,
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: { type: String, enum: ["pending", "completed", "canceled"], default: "pending" },
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Order", schema)