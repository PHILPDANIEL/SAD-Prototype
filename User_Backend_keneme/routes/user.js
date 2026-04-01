const express = require("express")
const router = express.Router()
const User = require("../models/user")

router.get("/profile", async (req, res) => {
  try {
    const user = await User.findOne()

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router