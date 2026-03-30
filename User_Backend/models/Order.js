const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customerName: String,
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: { type: String, enum: ["pending", "completed", "canceled"], default: "pending" },
  deliveryInfo: {
    label: String,
    details: String
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);