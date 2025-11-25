// backend/routes/category.routes.js
import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// API: Lấy tất cả sản phẩm theo category (electronics, fashion, v.v.)
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, sort = 'price-asc', search = '' } = req.query;

    // Tạo điều kiện tìm kiếm
    let query = { category: category };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Sắp xếp
    let sortObj = {};
    if (sort === 'price-asc') sortObj.price = 1;
    if (sort === 'price-desc') sortObj.price = -1;
    if (sort === 'rating-desc') sortObj.rating = -1;

    const products = await Product.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;