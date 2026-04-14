const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    permissions: Array,
    createdBy: String,
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

const Role = mongoose.model("Role", roleSchema, "roles");

module.exports = Role;
