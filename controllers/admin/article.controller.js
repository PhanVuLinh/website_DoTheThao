const moment = require("moment");
const slugify = require("slugify");
const Article = require("../../models/article.model");
const Account = require("../../models/account.model");

const variableCongfig = require("../../config/variable");
const paginationHelper = require("../../helpers/pagination.helper");

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
  //lọc theo ngày tạo
  const dateFilter = {};
  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    dateFilter.$gte = startDate;
  }
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    dateFilter.$lte = endDate;
  }
  if (Object.keys(dateFilter).length > 0) {
    find.createdAt = dateFilter;
  }

  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword, {
      lower: true,
      locale: "vi",
      strict: true,
    });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }

  //Phân trang
  const countArticle = await Article.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countArticle,
  );
  //hết Phân trang

  const articleList = await Article.find(find)
    .sort({ createdAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
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
    pagination: objectPagination,
  });
};

module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "active":
      case "inactive":
        await Article.updateMany(
          { _id: { $in: ids } },
          {
            status: type,
            updatedBy: updatedBy,
            updatedAt: new Date(),
          },
        );
        req.flash("success", `Đã cập nhật trạng thái ${ids.length} bài viết!`);
        break;

      case "delete-all":
        await Article.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash("success", `Đã chuyển ${ids.length} bài viết vào thùng rác!`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
    res.redirect(req.get("Referer"));
  }
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

module.exports.edit = async (req, res) => {
  try {
    const articleDetail = await Article.findOne({
      _id: req.params.id,
      deleted: false,
    });

    res.render("admin/pages/article-edit.pug", {
      title: "Chỉnh sửa bài viết",
      articleDetail: articleDetail,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalArticles = await Article.countDocuments({});
      req.body.position = totalArticles + 1;
    }
    req.body.updatedBy = req.account.id;
    if (req.file) {
      req.body.thumbnail = req.file.path;
    } else {
      delete req.body.thumbnail;
    }

    await Article.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    req.flash("success", "Chinh sửa bài viết thành công");
    res.redirect(`/${variableCongfig.pathAdmin}/article/edit/${id}`);
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
  }
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = slugify(req.query.keyword, {
      lower: true,
      locale: "vi",
      strict: true,
    });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }

  //Phân trang
  const countArticle = await Article.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countArticle,
  );
  //hết Phân trang
  const articleList = await Article.find(find)
    .sort({ deletedAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of articleList) {
    if (item.createdBy) {
      const infoAccountCreated = await Account.findOne({
        _id: item.createdBy,
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }
    if (item.deletedBy) {
      const infoAccountDeleted = await Account.findOne({
        _id: item.deletedBy,
      });
      item.deletedByFullName = infoAccountDeleted.fullName;
    }
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.deletedAtFormat = moment(item.deletedAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render("admin/pages/article-trash.pug", {
    title: "Thùng rác bài viết",
    articleList: articleList,
    pagination: objectPagination,
  });
};

module.exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    await Article.updateOne(
      { _id: id },
      {
        deleted: false,
      },
    );
    req.flash("success", "Khôi phục bài viết thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.deleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Article.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn bài viết thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.changeMultiTrash = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "restore-all":
        await Article.updateMany(
          { _id: { $in: ids } },
          {
            deleted: false,
          },
        );
        req.flash("success", `Đã khôi phục ${ids.length} bài viết!`);
        break;

      case "delete-all":
        await Article.deleteMany({
          _id: { $in: ids },
        });
        req.flash("success", `Đã xóa ${ids.length} vĩnh viễn bài viết`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
    res.redirect(req.get("Referer"));
  }
};
