// backend/routes/product.routes.js
import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// API CHI TIẾT SẢN PHẨM
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API SẢN PHẨM LIÊN QUAN
router.get('/related/:category', async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      _id: { $ne: req.query.exclude }
    }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;