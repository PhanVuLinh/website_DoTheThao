module.exports.editPatch = (req, res, next) => {
  const { fullName, phone } = req.body;

  if (!fullName || fullName.trim() === "") {
    req.flash("error", "Vui lòng nhập họ tên!");
    return res.redirect(req.get("Referer"));
  }

  if (fullName.trim().length < 2) {
    req.flash("error", "Họ tên phải có ít nhất 2 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (phone && !/^[0-9]{10,11}$/.test(phone)) {
    req.flash("error", "Số điện thoại không hợp lệ!");
    return res.redirect(req.get("Referer"));
  }

  next();
};


module.exports.changePasswordPatch = (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    req.flash("error", "Vui lòng nhập đầy đủ thông tin!");
    res.redirect(req.get("Referer"));
  }

  if (password.length < 6) {
    req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
    res.redirect(req.get("Referer"));
  }

  if (password !== confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không khớp!");
    res.redirect(req.get("Referer"));
  }

  next();
};