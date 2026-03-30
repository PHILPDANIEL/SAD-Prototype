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

// ---------------------- DATABASE CONNECTION ----------------------
mongoose.connect("mongodb://127.0.0.1:27017/sayotea_pos")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err))

// ================= USERS LOGIN =================
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
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: "Product deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/products/lowstock", async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lte: 10 } })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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

// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    const orders = await Order.find(filter).sort({ date: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get today's orders
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

// Place new order
app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, customerAddress, products } = req.body

    if (!products || products.length === 0)
      return res.status(400).json({ error: "Order must have at least one product" })

    let totalAmount = 0

    // Check stock and calculate total
    for (const item of products) {
      const product = await Product.findById(item.productId)
      if (!product) return res.status(404).json({ error: `Product ${item.name} not found` })
      if (product.stock < item.quantity)
        return res.status(400).json({ error: `Insufficient stock for ${item.name}` })

      totalAmount += item.price * item.quantity

      // Reduce stock
      product.stock -= item.quantity
      await product.save()

      // Log inventory
      const log = new Inventory({
        productId: product._id,
        productName: product.name,
        stockOut: item.quantity,
        remainingStock: product.stock,
        date: new Date()
      })
      await log.save()
    }

    // Save order
    const order = new Order({
      customerName,
      customerAddress,
      products,
      totalAmount,
      status: "pending",
      date: new Date()
    })
    await order.save()

    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update order status (complete/cancel)
app.put("/api/orders/:id", async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: "Order not found" })

    // If cancelling, restore stock
    if (status === "canceled" && order.status !== "canceled") {
      for (const item of order.products) {
        const product = await Product.findById(item.productId)
        if (product) {
          product.stock += item.quantity
          await product.save()
          const log = new Inventory({
            productId: product._id,
            productName: product.name,
            stockIn: item.quantity,
            remainingStock: product.stock,
            date: new Date()
          })
          await log.save()
        }
      }
    }

    order.status = status
    await order.save()
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ================= INVENTORY =================
app.get("/api/inventory", async (req, res) => {
  try {
    const logs = await Inventory.find().sort({ date: -1 })
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post("/api/inventory", async (req, res) => {
  try {
    const { productId, quantity } = req.body
    if (!productId || !quantity || quantity <= 0)
      return res.status(400).json({ error: "Invalid product or quantity" })

    const product = await Product.findById(productId)
    if (!product) return res.status(404).json({ error: "Product not found" })

    product.stock += Number(quantity)
    await product.save()

    const log = new Inventory({
      productId,
      productName: product.name,
      stockIn: Number(quantity),
      remainingStock: Number(product.stock),
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