const express = require("express");
const router = express.Router();

const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");


// Get logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Update profile
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        username,
        email,
        profilePicture
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;