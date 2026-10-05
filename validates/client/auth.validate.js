module.exports.registerPost = (req, res, next) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || fullName.trim() === "") {
    req.flashFormError("fullName", "Vui lòng nhập họ và tên!");
    return res.redirect(req.get("Referer"));
  }

  if (fullName.trim().length < 2) {
    req.flashFormError("fullName", "Họ và tên phải có ít nhất 2 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Vui lòng nhập email!");
    return res.redirect(req.get("Referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flashFormError("email", "Email không hợp lệ (Ví dụ: name@gmail.com)!");
    return res.redirect(req.get("Referer"));
  }

  if (!password || password.trim() === "") {
    req.flashFormError("password", "Vui lòng nhập mật khẩu!");
    return res.redirect(req.get("Referer"));
  }

  if (password.length < 6) {
    req.flashFormError("password", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (password !== confirmPassword) {
    req.flashFormError("confirmPassword", "Mật khẩu xác nhận không khớp!");
    return res.redirect(req.get("Referer"));
  }

  req.body.fullName = fullName.trim();
  req.body.email = email.trim();

  next();
};

module.exports.loginPost = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Vui lòng nhập email!");
    return res.redirect(req.get("Referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flashFormError("email", "Email không hợp lệ (Ví dụ: name@gmail.com)!");
    return res.redirect(req.get("Referer"));
  }

  if (!password || password.trim() === "") {
    req.flashFormError("password", "Vui lòng nhập mật khẩu!");
    return res.redirect(req.get("Referer"));
  }

  if (password.length < 6) {
    req.flashFormError("password", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  req.body.email = email.trim();

  next();
};

module.exports.forgotPasswordPost = (req, res, next) => {
  const { email } = req.body;

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Vui lòng nhập email!");
    return res.redirect(req.get("Referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flashFormError("email", "Email không hợp lệ!");
    return res.redirect(req.get("Referer"));
  }

  req.body.email = email.trim();

  next();
};

module.exports.otpPasswordPost = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Thiếu email!");
    return res.redirect(req.get("Referer"));
  }

  if (!otp || otp.trim() === "") {
    req.flashFormError("otp", "Vui lòng nhập mã OTP!");
    return res.redirect(req.get("Referer"));
  }

  if (!/^\d+$/.test(otp)) {
    req.flashFormError("otp", "Mã OTP chỉ được chứa chữ số!");
    return res.redirect(req.get("Referer"));
  }

  if (otp.length !== 6) {
    req.flashFormError("otp", "Mã OTP phải gồm 6 chữ số!");
    return res.redirect(req.get("Referer"));
  }

  next();
};

module.exports.resetPasswordPost = (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || password.trim() === "") {
    req.flashFormError("password", "Vui lòng nhập mật khẩu mới!");
    return res.redirect(req.get("Referer"));
  }

  if (password.length < 6) {
    req.flashFormError("password", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (!confirmPassword || confirmPassword.trim() === "") {
    req.flashFormError("confirmPassword", "Vui lòng xác nhận mật khẩu!");
    return res.redirect(req.get("Referer"));
  }

  if (password !== confirmPassword) {
    req.flashFormError("confirmPassword", "Mật khẩu xác nhận không khớp!");
    return res.redirect(req.get("Referer"));
  }

  next();
};
