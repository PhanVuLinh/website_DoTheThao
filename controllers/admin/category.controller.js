const moment = require("moment");
const variableCongfig = require("../../config/variable");
const Category = require("../../models/category.model");
const Account = require("../../models/account.model");

const categoryHelper = require("../../helpers/category.helper");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };
  //lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }

  //lọc theo người tạo
  if (req.query.createdBy) {
    find.createdBy = req.query.createdBy;
  }
  const categoryList = await Category.find(find).sort({
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
        _id: item.updatedBy,
      });
      item.updatedByFullName = infoAccountUpdated.fullName;
    }
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
  }
  //List ADMIN
  const accountAdminList = await Account.find({
    deleted: false,
  }).select("id fullName");

  res.render("admin/pages/category-list.pug", {
    title: "Danh sách danh mục",
    categoryList: categoryList,
    accountAdminList: accountAdminList,
  });
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  });
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

module.exports.edit = async (req, res) => {
  try {
    const categoryList = await Category.find({
      deleted: false,
    });
    const categoryTree = categoryHelper.buildCategoryTree(categoryList);
    const id = req.params.id;
    const categoryDetail = await Category.findOne({
      _id: id,
      deleted: false,
    });
    res.render("admin/pages/category-edit.pug", {
      title: "Chỉnh sửa danh mục",
      categoryList: categoryTree,
      categoryDetail: categoryDetail,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/category/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalCategories = await Category.countDocuments({});
      req.body.position = totalCategories + 1;
    }
    req.body.updatedBy = req.account.id;
    if (req.file) {
      req.body.thumbnail = req.file.path;
    } else {
      delete req.body.thumbnail;
    }
    await Category.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    req.flash("success", "Chinh sửa danh mục thành công");
    res.redirect(`/${variableCongfig.pathAdmin}/category/edit/${id}`);
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/category/list`);
  }
};

module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );
    req.flash("success", "Xóa danh mục thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/category/list`);
  }
};
