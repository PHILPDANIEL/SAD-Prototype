const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const SECRET = "sayotea_secret";

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const user = new User({
    username,
    email,
    password
  });

  await user.save();
  res.json({ message: "User registered" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id },
    SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user
  });
});

module.exports = router;