// ---------------------- IMPORTS ----------------------
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")

// ---------------------- MODELS ----------------------
const User = require("./models/User")
const Product = require("./models/Product")
const Order = require("./models/Order")
const Inventory = require("./models/Inventory")
const Sales = require("./models/Sales")

// ---------------------- APP SETUP ----------------------
const app = express()
app.use(cors())
app.use(bodyParser.json())



// ---------------------- ROUTES ----------------------

// --- USERS LOGIN ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email, password })
    if (user) return res.json({ success: true, user })
    res.json({ success: false, message: "Invalid credentials" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ================= PRODUCTS =================

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add product
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: "Product deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Low stock products
app.get("/api/products/lowstock", async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lte: 10 } })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Bestseller
app.get("/api/products/bestseller", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ================= ORDERS =================

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find()
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/orders/today", async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const orders = await Order.find({ date: { $gte: today, $lt: tomorrow } })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ================= INVENTORY =================

// Get all inventory logs
app.get("/api/inventory", async (req, res) => {
  try {
    const inventory = await Inventory.find()
    res.json(inventory)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add stock / restock product
app.post("/api/inventory", async (req, res) => {
  try {
    const { productId, quantity } = req.body
    const product = await Product.findById(productId)
    if (!product) return res.status(404).json({ error: "Product not found" })

    product.stock += Number(quantity)
    await product.save()

    const log = new Inventory({
      productId,
      productName: product.name,
      quantity,
      date: new Date()
    })
    await log.save()

    res.json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ================= SALES =================

app.get("/api/sales", async (req, res) => {
  try {
    const sales = await Sales.find()
    res.json(sales)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------------------- START SERVER ----------------------
const PORT = 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))