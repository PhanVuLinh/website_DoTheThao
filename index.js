const express = require("express");
const path = require("path");
require('dotenv').config();

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE);

const productController = require("./controllers/client/product.controller");
const homeController = require("./controllers/client/home.controller");

const app = express();
const port = 3000;

//Thiết lập views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Thiết lập thư mục tĩnh của FE
app.use(express.static(path.join(__dirname, "public")));

app.get("/", homeController.index);

app.get("/products", productController.list);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
