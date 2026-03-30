const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

// Get orders for a specific user, optional filter by status
router.get("/user/:id", async (req, res) => {
  try {
    const status = req.query.status; // pending/completed/canceled
    const filter = { userId: req.params.id };
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place order
router.post("/", async (req, res) => {
  try {
    const { userId, customerName, products, deliveryInfo } = req.body;
    if (!products || products.length === 0) return res.status(400).json({ error: "No products in order" });

    let totalAmount = 0;

    // Check stock and deduct
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: `${item.name} not found` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${item.name}` });

      totalAmount += item.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({ userId, customerName, products, totalAmount, status: "pending", deliveryInfo });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (cancel or complete)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;