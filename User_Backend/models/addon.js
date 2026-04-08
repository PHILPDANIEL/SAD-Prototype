const mongoose = require("mongoose");

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  category: { type: String, default: "General" }
}, { timestamps: true });

module.exports = mongoose.model("Addon", addonSchema, "addons");