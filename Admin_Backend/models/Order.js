const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // matches your DB ObjectId string
    required: true
  },

  items: [
    {
      name: String,
      qty: Number,
      price: Number
    }
  ],

  total: Number,

  status: {
    type: String,
    enum: ["pending", "completed", "canceled"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Order", schema)