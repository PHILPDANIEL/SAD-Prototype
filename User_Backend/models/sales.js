const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  orderId: String,
  productId: String,
  name: String,
  qty: Number,
  price: Number,
  total: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Sales", salesSchema);