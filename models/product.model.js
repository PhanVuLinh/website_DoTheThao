const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const productSchema = new mongoose.Schema(
  {
    title: String,
    category_id: String,
    position: Number,
    status: String,
    featured: String,
    thumbnail: String,
    images: Array,
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
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
