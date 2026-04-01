const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
  {
    customerName: String,

    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number
      }
    ],

    totalAmount: Number,

    status: {
      type: String,
      default: "pending"
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Order", orderSchema, "orders")