const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    title: String,
    code: String,
    discountPercentage: Number,
    maxDiscountAmount: Number,
    quantity: Number,
    expirationDate: {
      type: Date,
      required: true,
    },

    status: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    usedBy: Array,
    deletedAt: Date,
    createdBy: String,
    updatedBy: String,
    deletedBy: String,
  },
  {
    timestamps: true,
  },
);

const Coupon = mongoose.model("Coupon", couponSchema, "coupons");

module.exports = Coupon;
