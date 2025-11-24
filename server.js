// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// === IMPORT ROUTES ===
import productListRoutes from './routes/products.js';          // Danh sách + search
import productDetailRoutes from './routes/product.routes.js'; // Chi tiết sản phẩm + related
import categoryRoutes from './routes/category.routes.js';     // Electronics, Fashion, v.v.

// === ĐỌC .ENV TRƯỚC TIÊN ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

// === TẠO APP SAU KHI ĐÃ IMPORT HẾT ===
const app = express();

// === MIDDLEWARE ===
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// === ROUTES – ĐÚNG THỨ TỰ, ĐÚNG ĐƯỜNG DẪN ===
app.use('/api/products', productListRoutes);      // GET /api/products → danh sách, search
app.use('/api/products', productDetailRoutes);    // GET /api/products/:id → chi tiết
app.use('/api/categories', categoryRoutes);       // GET /api/categories/electronics

// === TRANG CHỦ ===
app.get('/', (req, res) => {
  res.send(`
    <h1>API E-COMMERCE ĐANG CHẠY NGON LÀNH 100%!</h1>
    <ul>
      <li>Danh sách: <a href="/api/products">/api/products</a></li>
      <li>Chi tiết: /api/products/:id</li>
      <li>Danh mục: <a href="/api/categories/electronics">/api/categories/electronics</a></li>
    </ul>
  `);
});

// === KẾT NỐI MONGODB ===
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.log('Lỗi kết nối DB:', err));

// === KHỞI ĐỘNG SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy tại: http://192.168.102.20:${PORT}`);
  console.log(`Trang chủ API: http://192.168.102.20:${PORT}`);
  console.log(`Electronics: http://192.168.102.20:${PORT}/api/categories/electronics`);
  console.log(`Chi tiết sản phẩm: http://192.168.102.20:${PORT}/api/products/6731a8d8f1a2c3d4e5f6g7h8`);
});