const md5 = require("md5");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const SettingWebsiteInfo = require("../../models/setting-website-info.model");
const variableCongfig = require("../../config/variable");

const permissonConfig = require("../../config/permission");

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

module.exports.accountAdminList = (req, res) => {
  res.render("admin/pages/setting-account-admin-list.pug", {
    title: "Danh sách tài khoản admin",
  });
};

module.exports.accountAdminCreate = (req, res) => {
  res.render("admin/pages/setting-account-admin-create.pug", {
    title: "Tạo tài khoản admin",
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

module.exports.roleList = async (req, res) => {
  const roleList = await Role.find({
    deleted: false,
  });

  res.render("admin/pages/setting-role-list.pug", {
    title: "Danh sách vai trò",
    roleList: roleList,
  });
};

module.exports.roleCreate = (req, res) => {
  res.render("admin/pages/setting-role-create.pug", {
    title: "Tạo vai trò",
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
