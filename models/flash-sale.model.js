const mongoose = require("mongoose");

const flashSaleItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    flashSalePrice: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 50,
      min: 1,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const flashSaleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    badge: {
      type: String,
      default: "GIỜ VÀNG GIÁ SỐC",
      trim: true,
    },
    subTitle: {
      type: String,
      default: "ƯU ĐÃI CÓ HẠN",
      trim: true,
    },
    description: {
      type: String,
      default: "Giày thi đấu & trang bị thể thao tuyển chọn giảm sâu số lượng có hạn.",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    items: [flashSaleItemSchema],
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
  }
);

flashSaleSchema.index({ deleted: 1, status: 1, startTime: 1, endTime: 1 });

const FlashSale = mongoose.model("FlashSale", flashSaleSchema, "flash_sales");

module.exports = FlashSale;
