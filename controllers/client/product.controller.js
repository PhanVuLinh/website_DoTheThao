const Product = require("../../models/product.model");

module.exports.list = async (req, res) => {
  const productList = await Product.find({});

  console.log(productList);

  res.render("client/pages/product-list.pug", {
    title: "Danh sách sản phẩm",
    productList: productList,
  });
};
