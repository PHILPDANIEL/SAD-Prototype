const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  profilePic: { type: String, default: "" },
  addresses: [
    {
      label: String,   // e.g., Home, Office
      details: String
    }
  ],
  acceptsPrivacy: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);