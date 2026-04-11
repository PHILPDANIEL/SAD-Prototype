const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const productRoutes = require("./routes/product")
const orderRoutes = require("./routes/order")
const userRoutes = require("./routes/user")
const authRoutes = require("./routes/auth")

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://127.0.0.1:27017/sayotea_pos")

mongoose.connection.once("open", () => {
  console.log("MongoDB connected")
})

app.use("/api/products", productRoutes)
app.use("/api/orders", require("./routes/order"))
app.use("/api/user", require("./routes/user"))
app.use("/api/auth", authRoutes)

app.listen(5001, () => {
  console.log("Server running on port 5001")
})