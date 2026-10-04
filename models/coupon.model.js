const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    title: String,
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
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

couponSchema.index({ code: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
couponSchema.index({ status: 1, deleted: 1 });

const Coupon = mongoose.model("Coupon", couponSchema, "coupons");

module.exports = Coupon;

