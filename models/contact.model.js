const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    content: String,
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

const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema, "contacts");

module.exports = Contact;

