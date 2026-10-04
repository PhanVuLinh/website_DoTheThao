const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: String, 
    cartId: String,
    orderCode: {
      type: String,
      required: true,
      trim: true,
    },
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

orderSchema.index({ orderCode: 1 }, { unique: true });
orderSchema.index({ user_id: 1, createdAt: -1 });
orderSchema.index({ deleted: 1, status: 1 });

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;

