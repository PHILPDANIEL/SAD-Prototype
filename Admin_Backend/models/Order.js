const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // matches your DB ObjectId string
    required: true
  },

  items: [
    {
      name: String,
      qty: Number,z
      price: Number
    }
  ],

  total: Number,

  status: {
    type: String,
   enum: ["pending", "preparing", "on_the_way", "completed"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Order", schema)