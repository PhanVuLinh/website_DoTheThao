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
    sizes: [
      {
        size: String,     
        stock: Number   
      }
    ],
    
    
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

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;