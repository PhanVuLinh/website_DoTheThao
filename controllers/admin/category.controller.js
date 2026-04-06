const moment = require("moment");
const variableCongfig = require("../../config/variable");
const Category = require("../../models/category.model");
const Account = require("../../models/account.model");

const categoryHelper = require("../../helpers/category.helper");

module.exports.list = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  }).sort({
    position: "asc",
  });

  for (const item of categoryList) {
    if (item.createdBy) {
      const infoAccountCreated = await Account.findOne({
        _id: item.createdBy,
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }
    if (item.updatedBy) {
      const infoAccountUpdated = await Account.findOne({
        _id: item.createdBy,
      });
      item.updatedByFullName = infoAccountUpdated.fullName;
    }
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render("admin/pages/category-list.pug", {
    title: "Danh sách danh mục",
    categoryList: categoryList,
  });
};

module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
    status: "active",
  };
  const categoryList = await Category.find(find);
  const categoryTree = categoryHelper.buildCategoryTree(categoryList);

  res.render("admin/pages/category-create.pug", {
    title: "Tạo mới danh mục",
    categoryList: categoryTree,
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
