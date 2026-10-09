const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "/client/assets/images/default-avatar.png",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedBuyer: {
      type: Boolean,
      default: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tagline: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "hidden", "inactive"],
      default: "active",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ product_id: 1, deleted: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user_id: 1, product_id: 1 });

const Review = mongoose.model("Review", reviewSchema, "reviews");

module.exports = Review;
