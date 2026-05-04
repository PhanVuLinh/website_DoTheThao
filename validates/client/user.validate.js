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
