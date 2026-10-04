module.exports.updateProfile = (req, res, next) => {
  const { fullName, email } = req.body;

  if (!fullName || fullName.trim() === "") {
    req.flash("error", "Vui lòng nhập họ và tên!");
    return res.redirect(req.get("Referer"));
  }

  if (fullName.trim().length < 2) {
    req.flash("error", "Họ và tên phải có ít nhất 2 ký tự!");
    return res.redirect(req.get("Referer"));
  }
  next();
};

module.exports.changePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword) {
    req.flash("error", "Vui lòng nhập mật khẩu hiện tại!");
    return res.redirect(req.get("Referer") || "/user/change-password");
  }

  if (!newPassword || newPassword.length < 6) {
    req.flash("error", "Mật khẩu mới phải có ít nhất 6 ký tự!");
    return res.redirect(req.get("Referer") || "/user/change-password");
  }

  if (newPassword !== confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không trùng khớp!");
    return res.redirect(req.get("Referer") || "/user/change-password");
  }

  next();
};

