const Product = require("../../models/product.model");
module.exports.index = async (req, res) => {
  //section 2
  const productListSection3 = await Product
    .find({
      deleted: false,
      status: "active",
    })
    .sort({
      position: "desc",
    })
    .limit(6);
  //End section 2
  res.render("client/pages/home.pug", {
    title: "Trang chủ",
    productListSection3: productListSection3,
  });
};
