const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: String, 
    cartId: String,
    orderCode: String,
    fullName: String,
    phone: String,
    address: String,
    note: String,
    products: Array,
    subtotal: Number,
    couponCode: String,
    discount: {
      type: Number,
      default: 0,
    },
    total: Number,
    paymentMethod: String,
    paymentStatus: String,
    status: String,
    updatedBy: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);
const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;
