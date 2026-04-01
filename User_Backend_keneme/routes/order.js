const express = require("express")
const router = express.Router()
const Order = require("../models/order")

// Get order stats
router.get("/stats", async (req, res) => {
  try {
    const total = await Order.countDocuments()

    const pending = await Order.countDocuments({
      status: { $regex: /^pending$/i }
    })

    const completed = await Order.countDocuments({
      status: { $regex: /^completed$/i }
    })

    res.json({
      total,
      pending,
      completed
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// Get recent orders (used in home.vue)
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)

    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router