const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get user profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put("/:id", async (req, res) => {
  try {
    const { username, profilePic, addresses, acceptsPrivacy } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username !== undefined) user.username = username;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (addresses !== undefined) user.addresses = addresses;
    if (acceptsPrivacy !== undefined) user.acceptsPrivacy = acceptsPrivacy;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;