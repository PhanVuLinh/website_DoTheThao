module.exports.list = (req, res) => {
  res.render("admin/pages/setting-list.pug", {
    title: "Danh sách cài đặt",
  });
}

module.exports.websiteInfo = (req, res) => {
  res.render("admin/pages/website-info.pug", {
    title: "Thông tin website",
  });
}

module.exports.accountAdminList = (req, res) => {
  res.render("admin/pages/setting-account-admin-list.pug", {
    title: "Danh sách tài khoản admin",
  });
}

module.exports.accountAdminCreate = (req, res) => {
  res.render("admin/pages/setting-account-admin-create.pug", {
    title: "Tạo tài khoản admin",
  });
}

module.exports.roleList = (req, res) => {
  res.render("admin/pages/setting-role-list.pug", {
    title: "Danh sách vai trò",
  });
}

module.exports.roleCreate = (req, res) => {
  res.render("admin/pages/setting-role-create.pug", {
    title: "Tạo vai trò",
  });
}