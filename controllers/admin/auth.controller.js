const md5 = require("md5");
const Account = require("../../models/Account.model");
const variableCongfig = require("../../config/variable");

module.exports.login = (req, res) => {
  res.render("admin/pages/login.pug", {
    title: "Đăng nhập",
  });
};

module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await Account.findOne({
    email: email,
    deleted: false,
  });
  if (!user) {
    req.flash("error", "Bạn chưa có tài khoản này");
    res.redirect(req.get("Referer"));
    return;
  }
  if (md5(password) !== user.password) {
    req.flash("error", "Mật khẩu không chính xác");
    res.redirect(req.get("Referer"));
    return;
  }
  if (user.status === "inactive") {
    req.flash("error", "Tài khoản đã bị khóa");
    res.redirect(req.get("Referer"));
    return;
  }

  res.cookie("token", user.token);

  res.redirect(`/${variableCongfig.pathAdmin}/dashboard`);
};

module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect(`/${variableCongfig.pathAdmin}/auth/login`);
};
