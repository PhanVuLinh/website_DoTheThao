module.exports.createPost = (req, res, next) => {
  const { fullName, email, password } = req.body;

  // Validate họ tên
  if (!fullName || fullName.trim() === "") {
    req.flash("error", "Vui lòng nhập họ và tên!");
    return res.redirect(req.get("Referer"));
  }

  if (fullName.trim().length < 2) {
    req.flash("error", "Họ tên phải có ít nhất 2 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  // Validate email
  if (!email || email.trim() === "") {
    req.flash("error", "Vui lòng nhập email!");
    return res.redirect(req.get("Referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    req.flash("error", "Email không đúng định dạng!");
    return res.redirect(req.get("Referer"));
  }

  // Validate password
  if (!password || password.trim() === "") {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    return res.redirect(req.get("Referer"));
  }

  if (password.length < 6) {
    req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  next();
};

module.exports.editPatch = (req, res, next) => {
  const { fullName, email, password } = req.body;

  // Validate họ tên
  if (!fullName || fullName.trim() === "") {
    req.flash("error", "Vui lòng nhập họ và tên!");
    return res.redirect(req.get("Referer"));
  }

  if (fullName.trim().length < 2) {
    req.flash("error", "Họ tên phải có ít nhất 2 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  // Validate email
  if (!email || email.trim() === "") {
    req.flash("error", "Vui lòng nhập email!");
    return res.redirect(req.get("Referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    req.flash("error", "Email không đúng định dạng!");
    return res.redirect(req.get("Referer"));
  }
  next();
};