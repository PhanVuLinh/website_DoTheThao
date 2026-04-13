const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: String,
    category_id: String,
    position: Number,
    status: String,
    thumbnail: String,
    price: Number,
    description: String,
    discountPercentage: Number,
    sizes: Array,
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: String,
    updatedBy: String,
    deletedBy: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
