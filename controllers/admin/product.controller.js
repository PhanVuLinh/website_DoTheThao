const moment = require("moment");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Account = require("../../models/account.model");
const variableCongfig = require("../../config/variable");
const categoryHelper = require("../../helpers/category.helper");

module.exports.list = async (req, res) => {
  let find = {
    deleted: false,
  };
  const productList = await Product.find(find).sort({
    position: "desc",
  });

  for (const item of productList) {
    if (item.createdBy) {
      const infoAccountCreated = await Account.findOne({
        _id: item.createdBy,
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }
    if (item.updatedBy) {
      const infoAccountUpdated = await Account.findOne({
        _id: item.updatedBy,
      });
      item.updatedByFullName = infoAccountUpdated.fullName;
    }
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render("admin/pages/product-list.pug", {
    title: "Danh sách sản phẩm",
    productList: productList,
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
  if (req.body.position) {
    req.body.position = parseInt(req.body.position);
  } else {
    const totalRecord = await Product.countDocuments({});
    req.body.position = totalRecord + 1;
  }

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.thumbnail = req.file ? req.file.path : "";
  req.body.price = req.body.price ? parseInt(req.body.price) : 0;
  req.body.discountPercentage = req.body.discountPercentage
    ? parseInt(req.body.discountPercentage)
    : 0;
  if (req.body.sizes) {
    req.body.sizes = req.body.sizes.map((item) => ({
      ...item,
      stock: item.stock ? parseInt(item.stock) : 0,
    }));
  }
  const newRecord = new Product(req.body);
  await newRecord.save();

  req.flash("success", "Tạo sản phẩm thành công");
  res.redirect(`/${variableCongfig.pathAdmin}/product/list`);
};

module.exports.trash = (req, res) => {
  res.render("admin/pages/product-trash.pug", {
    title: "Thùng rác sản phẩm",
  });
};
