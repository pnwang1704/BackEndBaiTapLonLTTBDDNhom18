// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// ĐĂNG KÝ
// backend/routes/auth.js – ĐÃ FIX HOÀN TOÀN!!!
router.post('/register', async (req, res) => {
  try {
    const { phone, password, name, email } = req.body;

    // Kiểm tra thiếu field bắt buộc
    if (!phone || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập số điện thoại và mật khẩu!' });
    }

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Số điện thoại đã được đăng ký!' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới – email là tùy chọn
    const user = await User.create({
      phone,
      password: hashedPassword,
      name: name || phone,
      email: email || undefined, // lưu email nếu có
    });

    // Tạo token ngay sau khi đăng ký
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '7d' });

    res.status(201).json({
      message: 'Đăng ký thành công!',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ĐĂNG NHẬP
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Tìm user
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Số điện thoại chưa được đăng ký!' });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng!' });

    // Tạo token
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '7d' });

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user._id, phone: user.phone, name: user.name }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;