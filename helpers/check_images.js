const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("../models/product.model");

async function check() {
  await mongoose.connect(process.env.DATABASE);
  const found = await Product.find({
    category_id: "69f0f8c84375cc4fd687e4b7"
  }).select("title thumbnail");
  console.log("Direct cat:", found);

  const allBadminton = await Product.find({
    title: { $regex: /(cầu lông|yonex|lining|victor)/i }
  }).select("title thumbnail");
  console.log("All badminton items:");
  allBadminton.forEach(p => console.log(p._id, p.title, p.thumbnail));

  process.exit(0);
}
check();
