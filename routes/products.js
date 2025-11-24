// backend/routes/products.js
import dotenv from 'dotenv';
dotenv.config(); // BẮT BUỘC PHẢI CÓ 2 DÒNG NÀY!!!

import express from 'express';
import Product from '../models/Product.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const router = express.Router();

// Cấu hình Cloudinary – BÂY GIỜ ĐÃ CÓ .env NÊN HOẠT ĐỘNG 100%!!!
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình multer lưu tạm vào memory
const upload = multer({ storage: multer.memoryStorage() });

// Hàm upload từ buffer lên Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'shop-app' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// GET tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST tạo sản phẩm + upload ảnh
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng upload ảnh!' });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const { name, price, rating = 4.5, category = 'Uncategorized' } = req.body;

    const product = new Product({
      name,
      price,
      image: result.secure_url,
      rating,
      category,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Lỗi upload:', err);
    res.status(500).json({ message: 'Upload ảnh thất bại!' });
  }
});

export default router;