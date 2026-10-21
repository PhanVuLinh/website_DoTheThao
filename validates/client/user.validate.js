module.exports.updateProfile = (req, res, next) => {
  const referer = req.get("Referer") || "/user/profile";
  const { fullName, phone } = req.body;

  if (!fullName || fullName.trim() === "") {
    req.flash("error", "Vui lòng nhập họ và tên!");
    return res.redirect(referer);
  }

  if (fullName.trim().length < 2) {
    req.flash("error", "Họ và tên phải có ít nhất 2 ký tự!");
    return res.redirect(referer);
  }
  req.body.fullName = fullName.trim();

  // Số điện thoại là tùy chọn trong hồ sơ, nhưng nếu điền thì kiểm tra định dạng
  if (phone && phone.trim() !== "") {
    const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, "");
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      req.flash("error", "Số điện thoại không hợp lệ (cần 10 chữ số, ví dụ: 0912345678)!");
      return res.redirect(referer);
    }
    req.body.phone = cleanPhone;
  }

  next();
};

module.exports.changePassword = (req, res, next) => {
  const referer = req.get("Referer") || "/user/profile";
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword) {
    req.flash("error", "Vui lòng nhập mật khẩu hiện tại!");
    return res.redirect(referer);
  }

  if (!newPassword || newPassword.length < 6) {
    req.flash("error", "Mật khẩu mới phải có ít nhất 6 ký tự!");
    return res.redirect(referer);
  }

  if (newPassword !== confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không trùng khớp!");
    return res.redirect(referer);
  }

  next();
};
