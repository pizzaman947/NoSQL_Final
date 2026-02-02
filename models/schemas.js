const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  model_name: { type: String, required: true },
  category: { type: String, index: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  specs: {
    cpu: String,
    gpu: String,
    ram: String,
    ssd: String
  },
  reviews: [{
    user: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }]
});

ProductSchema.index({ category: 1, price: -1 });

const UserSchema = new mongoose.Schema({
  full_name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' }
});

const OrderSchema = new mongoose.Schema({
  order_date: { type: Date, default: Date.now },
  status: { type: String, default: 'Processing' },
  total_amount: Number,
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }]
});

module.exports = {
  Product: mongoose.model('Product', ProductSchema),
  User: mongoose.model('User', UserSchema),
  Order: mongoose.model('Order', OrderSchema)
};