const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

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
      slug: "title",
      unique: true,
    },
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
  },
);

categorySchema.index({ deleted: 1, status: 1 });
categorySchema.index({ parent_id: 1, deleted: 1, status: 1 });
categorySchema.index({ position: -1 });

const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;

