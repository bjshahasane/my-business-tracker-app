import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
  type: String
},{ _id: false });

const OrderSchema = new mongoose.Schema({
  customerName: String,
  date: String,
  products: [ProductSchema],
  totalBeforeShipping: Number,
  totalAfterShipping: Number,
  isFulfilled: { type: Boolean, default: false },
  message: String,
  discount: Number,
  discountType : String,
  shipping: Number,
  
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
