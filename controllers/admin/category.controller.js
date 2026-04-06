const Category = require("../../models/category.model");
const variableCongfig = require("../../config/variable");

module.exports.list = (req, res) => {
  res.render("admin/pages/category-list.pug", {
    title: "Danh sách danh mục",
  });
};

module.exports.create = (req, res) => {
  res.render("admin/pages/category-create.pug", {
    title: "Tạo mới danh mục",
  });
};

module.exports.createPost = async (req, res) => {
  if (req.body.position) {
    req.body.position = parseInt(req.body.position);
  } else {
    const totalCategories = await Category.countDocuments({});
    req.body.position = totalCategories + 1;
  }
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.thumbnail = req.file ? req.file.path : "";

  const newRecord = new Category(req.body);
  await newRecord.save();

  req.flash("success", "Tạo danh mục thành công");
  res.redirect(`/${variableCongfig.pathAdmin}/category/list`);
};
