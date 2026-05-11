const md5 = require("md5");
const moment = require("moment");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const SettingWebsiteInfo = require("../../models/setting-website-info.model");
const variableCongfig = require("../../config/variable");
const permissonConfig = require("../../config/permission");

const paginationHelper = require("../../helpers/pagination.helper");

module.exports.list = (req, res) => {
  res.render("admin/pages/setting-list.pug", {
    title: "Danh sách cài đặt",
  });
};

module.exports.websiteInfo = async (req, res) => {
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  res.render("admin/pages/website-info.pug", {
    title: "Thông tin website",
    settingWebsiteInfo: settingWebsiteInfo,
  });
};

module.exports.websiteInfoPatch = async (req, res) => {
  if (req.files && req.files.logo) {
    req.body.logo = req.files.logo[0].path;
  } else {
    delete req.body.logo;
  }
  if (req.files && req.files.favicon) {
    req.body.favicon = req.files.favicon[0].path;
  } else {
    delete req.body.favicon;
  }
  if (req.files && req.files.heroImage) {
    req.body.heroImage = req.files.heroImage[0].path;
  } else {
    delete req.body.heroImage;
  }
  if (req.files && req.files.promoBannerImage) {
    req.body.promoBannerImage = req.files.promoBannerImage[0].path;
  } else {
    delete req.body.promoBannerImage;
  }
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  if (settingWebsiteInfo) {
    await SettingWebsiteInfo.updateOne(
      { _id: settingWebsiteInfo.id },
      req.body,
    );
  } else {
    const newRecord = new SettingWebsiteInfo(req.body);
    await newRecord.save();
  }

  req.flash("success", "Cập nhật thành công");
  res.redirect(req.get("Referer"));
};

module.exports.accountAdminList = async (req, res) => {
  const find = {
    deleted: false,
  };
  //lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }

  //lọc theo nhóm quyền
  if (req.query.role) {
    find.role_id = req.query.role;
  }

  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [
      { fullName: regexKeyword },
      { email: regexKeyword },
      { phone: regexKeyword },
    ];
  }

  //Phân trang
  const countAccount = await Account.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countAccount,
  );
  //hết Phân trang

  const accountList = await Account.find(find)
    .sort({ createdAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const account of accountList) {
    const role = await Role.findOne({
      deleted: false,
      _id: account.role_id,
    });
    account.role_name = role?.name || "Không có quyền";
  }

  const roleList = await Role.find({
    deleted: false,
  }).select("id name");

  res.render("admin/pages/setting-account-admin-list.pug", {
    title: "Tài khoản quản trị",
    roleList: roleList,
    accountList: accountList,
    pagination: objectPagination,
  });
};

module.exports.accountAdminChangeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "active":
      case "inactive":
        await Account.updateMany(
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
        await Account.updateMany(
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

module.exports.accountAdminCreate = async (req, res) => {
  const roles = await Role.find({
    deleted: false,
  }).select("_id  name");

  res.render("admin/pages/setting-account-admin-create.pug", {
    title: "Tạo tài khoản admin",
    roles: roles,
  });
};

module.exports.accountAdminCreatePost = async (req, res) => {
  const emailExist = await Account.findOne({
    email: req.body.email,
    deleted: false,
  });
  if (emailExist) {
    req.flash("error", "Email đã tồn tại");
    res.redirect(req.get("Referer"));
  } else {
    const record = new Account(req.body);
    record.password = md5(record.password);
    await record.save();

    req.flash("success", "Tạo tài khoản thành công");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminEdit = async (req, res) => {
  try {
    const id = req.params.id;
    const accountDetail = await Account.findOne({
      _id: id,
      deleted: false,
    });

    const roles = await Role.find({
      deleted: false,
    }).select("_id  name");

    res.render("admin/pages/setting-account-admin-edit.pug", {
      title: "Chỉnh sửa tài khoản",
      roles: roles,
      accountDetail: accountDetail,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminEditPatch = async (req, res) => {
  try {
    const emailExist = await Account.findOne({
      email: req.body.email,
      _id: { $ne: req.params.id },
      deleted: false,
    });

    if (emailExist) {
      req.flash("error", "Email đã tồn tại");
      res.redirect(req.get("Referer"));
    }

    if (req.body.password) req.body.password = md5(req.body.password);
    else delete req.body.password;

    await Account.updateOne({ _id: req.params.id }, req.body);

    req.flash("success", "Cập nhật tài khoản thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tại hoặc đã có lỗi xảy ra");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminDelete = async (req, res) => {
  try {
    const id = req.params.id;

    await Account.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );
    req.flash("success", "Xóa tài khoản thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminTrash = async (req, res) => {
  const find = {
    deleted: true,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [
      { fullName: regexKeyword },
      { email: regexKeyword },
      { phone: regexKeyword },
    ];
  }

  //Phân trang
  const countAccount = await Account.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countAccount,
  );
  //hết Phân trang
  const accountList = await Account.find(find)
    .sort({ deletedAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of accountList) {
    const role = await Role.findOne({
      _id: item.role_id,
      deleted: false,
    });
    item.role_name = role.name;
    item.deletedAtFormat = moment(item.deletedAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render("admin/pages/setting-account-admin-trash.pug", {
    title: "Thùng rác tài khoản",
    accountList: accountList,
    pagination: objectPagination,
  });
};

module.exports.accountAdminRestore = async (req, res) => {
  try {
    const id = req.params.id;
    await Account.updateOne(
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

module.exports.accountAdmindeleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Account.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn tai khoản thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.accountAdminChangeMultiTrash = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "restore-all":
        await Account.updateMany(
          { _id: { $in: ids } },
          {
            deleted: false,
          },
        );
        req.flash("success", `Đã khôi phục ${ids.length} tài khoản!`);
        break;

      case "delete-all":
        await Account.deleteMany({
          _id: { $in: ids },
        });
        req.flash("success", `Đã xóa ${ids.length} vĩnh viễn tài khoản`);
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

module.exports.roleList = async (req, res) => {
  const find = {
    deleted: false,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [{ name: regexKeyword }];
  }

  //Phân trang
  const countRole = await Role.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countRole,
  );
  //hết Phân trang
  const roleList = await Role.find(find)
    .sort({ createdAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of roleList) {
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

  res.render("admin/pages/setting-role-list.pug", {
    title: "Danh sách nhóm quyền",
    roleList: roleList,
    pagination: objectPagination,
  });
};

module.exports.roleChangeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "delete-all":
        await Role.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash(
          "success",
          `Đã chuyển ${ids.length} nhóm quyền vào thùng rác!`,
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

module.exports.roleCreate = (req, res) => {
  res.render("admin/pages/setting-role-create.pug", {
    title: "Tạo nhóm quyền",
    permissionList: permissonConfig.permissionList,
  });
};

module.exports.roleCreatePost = async (req, res) => {
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;

  const newRecord = new Role(req.body);
  await newRecord.save();

  req.flash("success", "Tạo nhóm quyền thành công");
  res.redirect(`/${variableCongfig.pathAdmin}/setting/role/list`);
};

module.exports.roleEdit = async (req, res) => {
  try {
    const id = req.params.id;

    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false,
    });

    res.render("admin/pages/setting-role-edit.pug", {
      title: "Chỉnh sửa nhóm quyền",
      permissionList: permissonConfig.permissionList,
      roleDetail: roleDetail,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/role/list`);
  }
};

module.exports.roleEditPatch = async (req, res) => {
  try {
    const id = req.params.id;
    req.body.updatedBy = req.account.id;
    await Role.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    req.flash("success", "Chỉnh sửa nhóm quyền thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/role/list`);
  }
};

module.exports.roleDelete = async (req, res) => {
  try {
    const id = req.params.id;

    await Role.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );
    req.flash("success", "Xóa nhóm quyền thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.roleTrash = async (req, res) => {
  const find = {
    deleted: true,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [{ name: regexKeyword }];
  }

  //Phân trang
  const countRole = await Role.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countRole,
  );
  //hết Phân trang
  const roleList = await Role.find(find)
    .sort({ deletedAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of roleList) {
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
  res.render("admin/pages/setting-role-trash.pug", {
    title: "Thùng rác nhóm quyền",
    roleList: roleList,
    pagination: objectPagination,
  });
};

module.exports.roleRestore = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne(
      { _id: id },
      {
        deleted: false,
      },
    );
    req.flash("success", "Khôi phục nhóm quyền thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/role/trash`);
  }
};

module.exports.roleDeleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.deleteOne({ _id: id });
    s;
    req.flash("success", "Đã xóa vĩnh viễn nhóm quyền thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/role/trash`);
  }
};

module.exports.roleChangeMultiTrash = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "restore-all":
        await Role.updateMany(
          { _id: { $in: ids } },
          {
            deleted: false,
          },
        );
        req.flash("success", `Đã khôi phục ${ids.length} nhóm quyền!`);
        break;

      case "delete-all":
        await Contact.deleteMany({
          _id: { $in: ids },
        });
        req.flash("success", `Đã xóa ${ids.length} vĩnh viễn nhóm quyền`);
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
