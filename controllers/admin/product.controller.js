const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const categoryHelper = require("../../helpers/category.helper");

module.exports.list = async (req, res) => {
  let find = {
    deleted: false,
  };
  const products = await Product.find(find);
  res.render("admin/pages/product-list.pug", {
    title: "Danh sách sản phẩm",
    products: products,
  });
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  });
  const categoryTree = categoryHelper.buildCategoryTree(categoryList);
  res.render("admin/pages/product-create.pug", {
    title: "Tạo sản phẩm mới",
    categoryList: categoryTree,
  });
};

module.exports.createPost = async (req, res) => {
  console.log(req.body);
  res.send("ok");
};

module.exports.trash = (req, res) => {
  res.render("admin/pages/product-trash.pug", {
    title: "Thùng rác sản phẩm",
  });
};
