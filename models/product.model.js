const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: String,
    product_category_id: {
      type: String, 
      default: ""
    },
    description: String,
    price: Number,
    discountPercentage: Number,
    sizes: [
      {
        size: String,     
        stock: Number   
      }
    ],
    thumbnail: String,
    status: String,
    featured: String,
    position: Number,
    createdBy: {
      account_id: String, 
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    updatedBy: [
      {
        account_id: String, 
        updatedAt: Date
      }
    ],

    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema, "product");

module.exports = Product;