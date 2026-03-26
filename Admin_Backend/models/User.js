const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("User", schema)