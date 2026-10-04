const mongoose = require("mongoose");
const generate = require("../helpers/generate.helper");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: String,
    token: {
      type: String,
      default: () => generate.generateRandomString(32),
    },
    status: {
      type: String,
      default: "active",
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

userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
userSchema.index({ token: 1 });

const User = mongoose.model("User", userSchema, "users");

module.exports = User;

