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
