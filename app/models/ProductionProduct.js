// models/productionProduct.js
import mongoose from 'mongoose';

const ProductionProductSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: String,
  type: String,
  pendingQuantity: { type: Number, default: 0 },
  completedQuantity: { type: Number, default: 0 },
});

export default mongoose.models.ProductionProduct ||
  mongoose.model('ProductionProduct', ProductionProductSchema);
