const Category = require("../../models/category.model");

module.exports.list = (req, res) => {
  res.render("admin/pages/category-list.pug", {
    title: "Danh sách danh mục",
  });
}

module.exports.create = (req, res) => {
  res.render("admin/pages/category-create.pug", {
    title: "Tạo mới danh mục",
  });
}

module.exports.createPost = async (req, res) => {
  if(req.body.position) {
    req.body.position = parseInt(req.body.position);
  } else {
    const totalCategories = await Category.countDocuments({});
    req.body.position = totalCategories + 1;
  }
  console.log(req.body);
  res.send("ok");
}