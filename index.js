const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

//Thiết lập views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render('client/pages/home.pug', {
      title: "Trang chủ"
  });
});

app.get("/products", (req, res) => {
    res.render('client/pages/product-list.pug', {
        title: "Danh sách sản phẩm"
    });

});

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
