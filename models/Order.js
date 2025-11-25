import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderCode: { type: Number, required: true, unique: true }, // Mã số để gửi qua PayOS
  user: { type: String, default: "Guest" }, // Hoặc ID user nếu có login
  items: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["PENDING", "PAID", "CANCELLED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
