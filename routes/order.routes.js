// backend/routes/order.routes.js
import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// API lấy đơn hàng có lọc theo status (PENDING hoặc PAID)
router.get("/my-orders", async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    // Nếu có status gửi lên thì lọc, không thì lấy hết
    if (status) {
      filter.status = status;
    }

    // Sắp xếp mới nhất lên đầu (-1)
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
