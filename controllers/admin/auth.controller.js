const Account = require("../../models/account.model");
const variableCongfig = require("../../config/variable");
const jwtHelper = require("../../helpers/jwt.helper");
const passwordHelper = require("../../helpers/password.helper");

module.exports.login = (req, res) => {
  const token = req.cookies.tokenAdmin || req.cookies.token;
  if (token && jwtHelper.verifyToken(token)) {
    return res.redirect(`/${variableCongfig.pathAdmin}/dashboard`);
  }
  res.render("admin/pages/login.pug", {
    title: "Đăng nhập",
  });
};

module.exports.loginPost = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      req.flash("error", "Vui lòng nhập đầy đủ email và mật khẩu!");
      return res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/auth/login`);
    }

    const user = await Account.findOne({
      email: email,
      deleted: false,
    });

    if (!user) {
      req.flash("error", "Tài khoản không tồn tại trong hệ thống!");
      return res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/auth/login`);
    }

    const isMatch = await passwordHelper.comparePassword(password, user.password);
    if (!isMatch) {
      req.flash("error", "Mật khẩu không chính xác!");
      return res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/auth/login`);
    }

    if (user.status === "inactive") {
      req.flash("error", "Tài khoản đã bị khóa!");
      return res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/auth/login`);
    }

    // Tự động nâng cấp mật khẩu sang bcryptjs nếu trước đó là MD5
    if (!passwordHelper.isBcryptHash(user.password)) {
      user.password = await passwordHelper.hashPassword(password);
      await user.save();
    }

    // Tạo JWT token an toàn
    const token = jwtHelper.generateToken({
      accountId: user.id,
      email: user.email,
      role_id: user.role_id,
    });

    // Cập nhật token vào model
    await Account.updateOne({ _id: user.id }, { token: token });

    // Lưu cookie namespace riêng cho admin với cờ bảo mật httpOnly
    res.cookie("tokenAdmin", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    req.flash("success", "Đăng nhập thành công!");
    res.redirect(`/${variableCongfig.pathAdmin}/dashboard`);
  } catch (error) {
    console.error("Admin Login Error:", error);
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
    res.redirect(`/${variableCongfig.pathAdmin}/auth/login`);
  }
};

module.exports.logout = (req, res) => {
  res.clearCookie("tokenAdmin");
  res.clearCookie("token");
  req.flash("success", "Đã đăng xuất thành công!");
  res.redirect(`/${variableCongfig.pathAdmin}/auth/login`);
};
