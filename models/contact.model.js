const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    email: String,
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

const Contact = mongoose.model("Contact", contactSchema, "contacts");

module.exports = Contact;
