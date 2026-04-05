const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: String,
    parent_id: String,
    description: String,
    thumbnail: String,
    status: String,
    position: Number,
    slug: {
      type: String,
      unique: true,
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

const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;
