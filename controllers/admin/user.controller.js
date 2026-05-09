const md5 = require("md5");
const moment = require("moment");
const Account = require("../../models/account.model");
const User = require("../../models/user.model");

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

  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [{ fullName: regexKeyword }, { email: regexKeyword }];
  }
  //Phân trang
  const countUser = await User.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countUser,
  );
  //hết Phân trang
  const userList = await User.find(find)
    .sort({ createdAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of userList) {
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

  res.render("admin/pages/user-list.pug", {
    title: "Danh sách khách hàng",
    userList: userList,
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
        await User.updateMany(
          { _id: { $in: ids } },
          {
            status: type,
            updatedBy: updatedBy,
            updatedAt: new Date(),
          },
        );
        req.flash("success", `Đã cập nhật trạng thái ${ids.length} tài khoản!`);
        break;

      case "delete-all":
        await User.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash(
          "success",
          `Đã chuyển ${ids.length} tài khoản vào thùng rác!`,
        );
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
  res.render("admin/pages/user-create.pug", {
    title: "Thêm mới khách hàng",
  });
};

module.exports.createPost = async (req, res) => {
  try {
    const existEmail = await User.findOne({
      email: req.body.email,
      deleted: false,
    });

    if (existEmail) {
      req.flash("error", "Email đã tồn tại");
      res.redirect(req.get("Referer"));
    } else {
      req.body.createdBy = req.account.id;
      req.body.updatedBy = req.account.id;
      const record = new User(req.body);
      record.password = md5(record.password);
      await record.save();

      req.flash("success", "Tạo tài khoản khách hàng thành công!");
      res.redirect(`/${variableCongfig.pathAdmin}/user/list`);
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Đã có lỗi xảy ra khi tạo khách hàng!");
    res.redirect("back");
  }
};

module.exports.edit = async (req, res) => {
  try {
    const find = {
      _id: req.params.id,
      deleted: false,
    };
    const userDetail = await User.findOne(find);
    res.render("admin/pages/user-edit.pug", {
      title: "Chình sửa khách hàng",
      userDetail: userDetail,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/user/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const find = {
      _id: req.params.id,
      deleted: false,
    };
    if (req.body.password) req.body.password = md5(req.body.password);
    await User.updateOne(find, req.body);
    req.flash("success", "Cập nhật tài khoản khách hàng thành công!");
    res.redirect(`/${variableCongfig.pathAdmin}/user/edit/${req.params.id}`);
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/user/list`);
  }
};

module.exports.delete = async (req, res) => {
  try {
    const find = {
      _id: req.params.id,
      deleted: false,
    };
    await User.updateOne(find, {
      deleted: true,
      deletedBy: req.account.id,
      deletedAt: Date.now(),
    });
    req.flash("success", "Xóa tài khoản khách hàng thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/user/list`);
  }
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [{ fullName: regexKeyword }, { email: regexKeyword }];
  }
  //Phân trang
  const countUser = await User.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countUser,
  );
  //hết Phân trang
  const userList = await User.find(find)
    .sort({ deletedAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
  for (const item of userList) {
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
  res.render("admin/pages/user-trash.pug", {
    title: "Thùng rác tài khoản khách hàng",
    userList: userList,
    pagination: objectPagination,
  });
};

module.exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    await User.updateOne(
      { _id: id },
      {
        deleted: false,
      },
    );
    req.flash("success", "Khôi phục tài khoản thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.deleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await User.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn tài khoản thành công");
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
        await User.updateMany(
          { _id: { $in: ids } },
          {
            deleted: false,
          },
        );
        req.flash(
          "success",
          `Đã khôi phục ${ids.length} tài khoản khách hàng!`,
        );
        break;

      case "delete-all":
        await User.deleteMany({
          _id: { $in: ids },
        });
        req.flash(
          "success",
          `Đã xóa ${ids.length} vĩnh viễn tài khoản khách hàng`,
        );
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
