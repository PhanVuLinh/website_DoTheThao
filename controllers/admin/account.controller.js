module.exports.login = (req, res) => {
  res.render("admin/pages/login.pug", {
    title: "Đăng nhập",
  });
}