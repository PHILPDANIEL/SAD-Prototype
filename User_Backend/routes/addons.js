// routes/addons.js
const express = require("express");
const router = express.Router();
const Addon = require("../models/addon"); // your addons model

// GET all addons
router.get("/", async (req, res) => {
  try {
    const addons = await Addon.find({ isAvailable: { $ne: false } });
    res.json(addons);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch addons" });
  }
});

// GET single addon
router.get("/:id", async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id);
    if (!addon) return res.status(404).json({ error: "Addon not found" });
    res.json(addon);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch addon" });
  }
});

// POST create addon (admin)
router.post("/", async (req, res) => {
  try {
    const addon = new Addon(req.body);
    await addon.save();
    res.status(201).json(addon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update addon (admin)
router.put("/:id", async (req, res) => {
  try {
    const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(addon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE addon (admin)
router.delete("/:id", async (req, res) => {
  try {
    await Addon.findByIdAndDelete(req.params.id);
    res.json({ message: "Addon deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete addon" });
  }
});

module.exports = router;