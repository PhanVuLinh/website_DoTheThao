const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("../models/product.model");

async function fix() {
  await mongoose.connect(process.env.DATABASE);

  await Product.updateOne(
    { title: /Thành Công 77/i },
    { $set: { thumbnail: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80" } }
  );

  await Product.updateOne(
    { title: /Aerosensa 50/i },
    { $set: { thumbnail: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80" } }
  );

  await Product.updateOne(
    { title: /Victor Thruster/i },
    { $set: { thumbnail: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80" } }
  );

  console.log("Updated badminton equipment thumbnails cleanly!");
  process.exit(0);
}
fix();
