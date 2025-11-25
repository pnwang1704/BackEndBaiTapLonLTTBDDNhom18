import express from "express";
import dotenv from "dotenv";
import { createRequire } from "module";
import Order from "../models/Order.js"; // Import Model Order

const require = createRequire(import.meta.url);
const PayOSLib = require("@payos/node");

dotenv.config();
const router = express.Router();

// Tự động tìm Class PayOS
const PayOS = PayOSLib.PayOS || PayOSLib.default || PayOSLib;

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// 1. API TẠO LINK (Bạn đang chạy tốt phần này)
router.post("/create-payment-link", async (req, res) => {
  try {
    const { amount, returnUrl, cancelUrl, cartItems } = req.body;
    const orderCode = Number(String(Date.now()).slice(-6));

    // Lưu DB
    try {
      if (Order) {
        const newOrder = new Order({
          orderCode: orderCode,
          totalAmount: amount,
          items: cartItems || [],
          status: "PENDING",
        });
        await newOrder.save();
        console.log("-> Đã lưu đơn hàng vào DB");
      }
    } catch (dbError) {
      console.error("Lỗi lưu DB:", dbError.message);
    }

    // Chốt cứng 2000đ để test
    const body = {
      orderCode: orderCode,
      amount: 10000,
      description: `Thanh toan #${orderCode}`,
      returnUrl: returnUrl,
      cancelUrl: cancelUrl,
    };

    // Gọi hàm tạo link (Hỗ trợ nhiều version)
    let response;
    if (typeof payos.createPaymentLink === "function") {
      response = await payos.createPaymentLink(body);
    } else if (
      payos.paymentRequests &&
      typeof payos.paymentRequests.create === "function"
    ) {
      response = await payos.paymentRequests.create(body);
    } else {
      throw new Error("Không tìm thấy hàm createPaymentLink");
    }

    console.log("2. Tạo link thành công:", response.checkoutUrl);

    res.json({
      checkoutUrl: response.checkoutUrl,
      orderCode: orderCode,
    });
  } catch (error) {
    console.error("LỖI TẠO LINK:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. API CHECK TRẠNG THÁI (SỬA LẠI PHẦN NÀY ĐỂ HẾT LỖI)
router.post("/check-status-transaction", async (req, res) => {
  try {
    const { orderCode } = req.body;
    console.log("3. Đang kiểm tra đơn hàng:", orderCode);

    let paymentLinkInfo;

    // --- CƠ CHẾ TỰ DÒ TÌM HÀM (FIX LỖI NOT A FUNCTION) ---

    // Cách 1: Gọi kiểu cũ
    if (typeof payos.getPaymentLinkInformation === "function") {
      paymentLinkInfo = await payos.getPaymentLinkInformation(orderCode);
    }
    // Cách 2: Gọi kiểu mới (PayOS v1.x) - Nằm trong paymentRequests
    else if (
      payos.paymentRequests &&
      typeof payos.paymentRequests.get === "function"
    ) {
      paymentLinkInfo = await payos.paymentRequests.get(orderCode);
    }
    // Cách 3: Dự phòng
    else {
      console.error("DEBUG PayOS Object:", payos); // In ra để xem cấu trúc nếu vẫn lỗi
      throw new Error(
        "Không tìm thấy hàm getPaymentLinkInformation trong thư viện"
      );
    }
    // -----------------------------------------------------

    console.log("-> Trạng thái từ PayOS:", paymentLinkInfo.status);

    if (paymentLinkInfo.status === "PAID") {
      if (Order) {
        await Order.findOneAndUpdate({ orderCode }, { status: "PAID" });
      }
      return res.json({ status: "PAID" });
    }
    return res.json({ status: "PENDING" });
  } catch (error) {
    console.error("LỖI CHECK STATUS:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
