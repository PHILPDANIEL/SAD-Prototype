const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  price: Number,
  stock: Number
})

module.exports = mongoose.model("Product", schema)

