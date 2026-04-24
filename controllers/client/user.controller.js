const md5 = require("md5");
const User = require("../../models/user.model");

module.exports.login = async (req, res) => {
  res.render("client/pages/user-login.pug", {
    title: "Đăng nhập",
  });
};

module.exports.loginPost = async (req, res) => {
  try {
    const email = req.body.email;
    const password = md5(req.body.password);
    const user = await User.findOne({
      email: email,
      deleted: false,
    });

    if (!user) {
      req.flash("error", "Email không tồn tại");
      return res.redirect(req.get("Referer"));
    }
    if (password !== user.password) {
      req.flash("error", "Sai mật khẩu");
      return res.redirect(req.get("Referer"));
    }

    if (user.status === "inactive") {
      req.flash("error", "Tài khoản đang bị khóa");
      return res.redirect(req.get("Referer"));
    }

    res.cookie("token", user.token);
    req.flash("success", "Đăng nhập thành công!");

    let redirectUrl = "/";
    if (req.session.returnTo) {
      redirectUrl = req.session.returnTo;
      delete req.session.returnTo;
    }
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.register = async (req, res) => {
  res.render("client/pages/user-register.pug", {
    title: "Đăng ký",
  });
};

module.exports.registerPost = async (req, res) => {
  try {
    const existEmail = await User.findOne({ email: req.body.email });
    if (existEmail) {
      req.flash("error", "Email đã tồn tại");
      return res.redirect(req.get("Referer"));
    }

    delete req.body.confirmPassword;
    req.body.password = md5(req.body.password);

    const newUser = new User(req.body);
    await newUser.save();
    console.log(newUser);
    req.flash("success", "Tạo tài khoản thành công");
    res.redirect("/user/login");
  } catch (error) {
    console.error(error);
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};
