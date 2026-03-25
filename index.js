const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require('dotenv').config();

mongoose.connect(process.env.DATABASE);
const Product = mongoose.model("Product", {
  title: String,
  description: String,
  price: Number,
  discountPercentage: Number,
  stock: Number,
  status: String,
  position: Number,
  deleted: Boolean,
});

const app = express();
const port = 3000;

//Thiết lập views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Thiết lập thư mục tĩnh của FE
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("client/pages/home.pug", {
    title: "Trang chủ",
  });
});

app.get("/products", async (req, res) => {
  const productList = await Product.find({});

  console.log(productList);

  res.render("client/pages/product-list.pug", {
    title: "Danh sách sản phẩm",
    productList: productList,
  });
});

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
