// backend/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  image: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    default: 4.5,
    min: 0,
    max: 5 
  },
  category: { 
    type: String, 
    required: true,
    default: 'uncategorized',
    lowercase: true 
  },
  description: { 
    type: String, 
    default: 'Sản phẩm chất lượng cao, chính hãng 100%. Bảo hành chính hãng. Giao hàng nhanh toàn quốc.' 
  },

  // THÊM 2 TRƯỜNG SIÊU QUAN TRỌNG!!!
  stock: { 
    type: Number, 
    required: true,
    default: 99,        // Mỗi sản phẩm mới tạo sẽ có 99 cái (bạn có thể sửa sau)
    min: 0 
  },
  sold: { 
    type: Number, 
    default: 0,         // Ban đầu chưa bán được cái nào
    min: 0 
  },

}, { 
  timestamps: true,     // tự động thêm createdAt & updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Tạo index để tìm kiếm nhanh hơn (tùy chọn nhưng cực kỳ nên có)
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sold: -1 });    // Sắp xếp bán chạy
productSchema.index({ createdAt: -1 }); // Hàng mới về

export default mongoose.model('Product', productSchema);