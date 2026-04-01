const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,

  items: [
    {
      productId: String,
      name: String,
      qty: Number,
      price: Number
    }
  ],

  total: Number,
  status: {
    type: String,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);