const moment = require("moment");
const Article = require("../../models/article.model");
const Account = require("../../models/account.model");

const variableCongfig = require("../../config/variable");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };
  const articleList = await Article.find(find).sort({ createdAt: "desc" });

  for (const item of articleList) {
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

  const accountAdminList = await Account.find({
    deleted: false,
  }).select("id fullName");
  res.render("admin/pages/article-list.pug", {
    title: "Danh sách bài viết",
    articleList: articleList,
    accountAdminList: accountAdminList,
  });
};

module.exports.create = (req, res) => {
  res.render("admin/pages/article-create.pug", {
    title: "Tạo mới bài viết",
  });
};

module.exports.createPost = async (req, res) => {
  try {
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalArticles = await Article.countDocuments({});
      req.body.position = totalArticles + 1;
    }
    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;
    req.body.thumbnail = req.file ? req.file.path : "";
    const newRecord = new Article(req.body);
    await newRecord.save();
    req.flash("success", "Tạo bài viết mới");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
  }
};

module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Article.updateOne(
      { _id: id },
      { deleted: true, deletedBy: req.account.id, deletedAt: Date.now() },
    );
    req.flash("success", "Xóa bài viết");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
  }
};
