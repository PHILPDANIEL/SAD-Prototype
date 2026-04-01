const express = require("express");
const router = express.Router();

const Order = require("../models/order");
const Product = require("../models/product");
const Sales = require("../models/sales");
const authMiddleware = require("../middleware/authMiddleware");


// Dashboard stats
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const total = await Order.countDocuments({ userId: req.user.id });
    const pending = await Order.countDocuments({
      userId: req.user.id,
      status: "pending"
    });
    const completed = await Order.countDocuments({
      userId: req.user.id,
      status: "completed"
    });

    res.json({ total, pending, completed });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Get user orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to load orders" });
  }
});


// Create order (checkout)
router.post("/create", authMiddleware, async (req, res) => {
  const { items, total } = req.body;

  try {

    // Check stock
    for (let item of items) {
      const product = await Product.findById(item._id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `${product.name} out of stock`
        });
      }
    }

    // Create order
    const order = new Order({
      userId: req.user.id,
      items,
      total
    });

    await order.save();

    // Deduct stock + record sales
    for (let item of items) {
      const product = await Product.findById(item._id);

      product.stock -= item.qty;
      await product.save();

      const sale = new Sales({
        orderId: order._id,
        productId: product._id,
        name: product.name,
        qty: item.qty,
        price: product.price,
        total: item.qty * product.price
      });

      await sale.save();
    }

    res.json({
      message: "Order placed successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Order failed"
    });
  }
});

module.exports = router;