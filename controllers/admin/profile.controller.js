module.exports.edit = (req, res) => {
  res.render("admin/pages/profile-edit.pug", {
    title: "Chỉnh sửa hồ sơ",
  });
}

module.exports.changePassword = (req, res) => {
  res.render("admin/pages/profile-change-password.pug", {
    title: "Đổi mật khẩu",
  });
}