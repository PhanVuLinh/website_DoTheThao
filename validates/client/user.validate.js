module.exports.registerPost = (req, res, next) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || fullName.trim() === "") {
    req.flash("error", "Vui lòng nhập họ và tên!");
    return res.redirect(req.get("Referer"));
  }

  if (fullName.trim().length < 2) {
    req.flash("error", "Họ và tên phải có ít nhất 2 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (!email || email.trim() === "") {
    req.flash("error", "Vui lòng nhập email!");
    return res.redirect(req.get("Referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash("error", "Email không hợp lệ!");
    return res.redirect(req.get("Referer"));
  }

  if (!password || password.trim() === "") {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    return res.redirect(req.get("Referer"));
  }

  if (password.length < 6) {
    req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (password !== confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không khớp!");
    return res.redirect(req.get("Referer"));
  }

  req.body.fullName = fullName.trim();
  req.body.email = email.trim();

  next();
};

module.exports.loginPost = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === "") {
    req.flash("error", "Vui lòng nhập email!");
    return res.redirect(req.get("Referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash("error", "Email không hợp lệ!");
    return res.redirect(req.get("Referer"));
  }

  if (!password || password.trim() === "") {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    return res.redirect(req.get("Referer"));
  }

  if (password.length < 6) {
    req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  req.body.email = email.trim();

  next();
};

module.exports.forgotPasswordPost = (req, res, next) => {
  const { email } = req.body;

  if (!email || email.trim() === "") {
    req.flash("error", "Vui lòng nhập email!");
    return res.redirect(req.get("Referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash("error", "Email không hợp lệ!");
    return res.redirect(req.get("Referer"));
  }

  req.body.email = email.trim();

  next();
};

module.exports.otpPasswordPost = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || email.trim() === "") {
    req.flash("error", "Thiếu email!");
    return res.redirect(req.get("Referer"));
  }

  if (!otp || otp.trim() === "") {
    req.flash("error", "Vui lòng nhập mã OTP!");
    return res.redirect(req.get("Referer"));
  }

  if (!/^\d+$/.test(otp)) {
    req.flash("error", "OTP chỉ được chứa số!");
    return res.redirect(req.get("Referer"));
  }

  if (otp.length !== 6) {
    req.flash("error", "OTP phải gồm 6 chữ số!");
    return res.redirect(req.get("Referer"));
  }

  next();
};

module.exports.resetPasswordPost = (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || password.trim() === "") {
    req.flash("error", "Vui lòng nhập mật khẩu mới!");
    return res.redirect(req.get("Referer"));
  }

  if (password.length < 6) {
    req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (!confirmPassword || confirmPassword.trim() === "") {
    req.flash("error", "Vui lòng xác nhận mật khẩu!");
    return res.redirect(req.get("Referer"));
  }

  if (password !== confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không khớp!");
    return res.redirect(req.get("Referer"));
  }

  next();
};
