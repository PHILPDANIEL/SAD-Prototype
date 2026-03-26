const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")

// Models
const User = require("./models/User")
const Product = require("./models/Product")
const Order = require("./models/Order")
const Inventory = require("./models/Inventory")
const Sales = require("./models/Sales")

const app = express()
app.use(cors())
app.use(bodyParser.json())

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/sayotea_db")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err))
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err))

// --------- API Routes ---------

// Users: login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email, password })
  if (user) return res.json({ success: true, user })
  res.json({ success: false, message: "Invalid credentials" })
})

// Products
app.get("/api/products", async (req, res) => {
  const products = await Product.find()
  res.json(products)
})
app.get("/api/products/lowstock", async (req, res) => {
  const products = await Product.find({ stock: { $lte: 10 } })
  res.json(products)
})
app.get("/api/products/bestseller", async (req, res) => {
  const orders = await Order.find()
  const productCount = {}
  orders.forEach(order => {
    order.products.forEach(p => {
      productCount[p.name] = (productCount[p.name] || 0) + p.quantity
    })
  })
  let best = { name: "N/A", quantity: 0 }
  for (const key in productCount) {
    if (productCount[key] > best.quantity) {
      best.name = key
      best.quantity = productCount[key]
    }
  }
  res.json(best)
})

// Orders
app.get("/api/orders", async (req, res) => {
  const orders = await Order.find()
  res.json(orders)
})
app.get("/api/orders/today", async (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const orders = await Order.find({
    date: { $gte: today, $lt: tomorrow }
  })
  res.json(orders)
})

// Inventory
app.get("/api/inventory", async (req, res) => {
  const inventory = await Inventory.find()
  res.json(inventory)
})

// Sales
app.get("/api/sales", async (req, res) => {
  const sales = await Sales.find()
  res.json(sales)
})

// --------- START SERVER ---------
const PORT = 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))