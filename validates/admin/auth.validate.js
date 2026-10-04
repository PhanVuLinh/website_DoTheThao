module.exports.loginPost = (req, res, next) => {
  if (typeof req.body.email !== "string" || !req.body.email.trim()) {
    req.flash("error", "Vui lòng nhập email hợp lệ!");
    return res.redirect(req.get("Referer") || "/admin/auth/login");
  }
  if (typeof req.body.password !== "string" || !req.body.password) {
    req.flash("error", "Vui lòng nhập mật khẩu hợp lệ!");
    return res.redirect(req.get("Referer") || "/admin/auth/login");
  }

  req.body.email = req.body.email.trim();
  next();
};
