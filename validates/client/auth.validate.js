module.exports.loginPost = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === "") {
    req.flash("error", "Vui lòng nhập email!");
    req.flash("oldData", req.body);
    return res.redirect(req.get("Referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash("error", "Email không hợp lệ!");
    req.flash("oldData", req.body);
    return res.redirect(req.get("Referer"));
  }

  if (!password || password.trim() === "") {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    return res.redirect(req.get("Referer"));
  }

  if (password.length < 6) {
    req.flash("error", "Mật khẩu phải ít nhất 6 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  next();
};