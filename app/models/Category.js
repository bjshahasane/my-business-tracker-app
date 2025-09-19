import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  id: { type: String, required: true },   // custom id
  name: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false }); // disable mongoose auto _id for subdocs

const categorySchema = new Schema({
  type: { type: String, required: true },
  category: { type: String, required: true },
  itemList: [productSchema]
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
