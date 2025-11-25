// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  email: { type: String, default: null }, // THÊM DÒNG NÀY – email tùy chọn
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);