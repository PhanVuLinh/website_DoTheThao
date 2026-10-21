module.exports.registerPost = (req, res, next) => {
  const referer = req.get("Referer") || "/auth/register";
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || fullName.trim() === "") {
    req.flashFormError("fullName", "Vui lòng nhập họ và tên!");
    return res.redirect(referer);
  }

  if (fullName.trim().length < 2) {
    req.flashFormError("fullName", "Họ và tên phải có ít nhất 2 ký tự!");
    return res.redirect(referer);
  }

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Vui lòng nhập email!");
    return res.redirect(referer);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flashFormError("email", "Email không hợp lệ (Ví dụ: name@gmail.com)!");
    return res.redirect(referer);
  }

  if (!password || password.trim() === "") {
    req.flashFormError("password", "Vui lòng nhập mật khẩu!");
    return res.redirect(referer);
  }

  if (password.length < 6) {
    req.flashFormError("password", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(referer);
  }

  if (password !== confirmPassword) {
    req.flashFormError("confirmPassword", "Mật khẩu xác nhận không khớp!");
    return res.redirect(referer);
  }

  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports.loginPost = (req, res, next) => {
  const referer = req.get("Referer") || "/auth/login";
  const { email, password } = req.body;

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Vui lòng nhập email đăng nhập!");
    return res.redirect(referer);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flashFormError("email", "Email không đúng định dạng!");
    return res.redirect(referer);
  }

  if (!password || password.trim() === "") {
    req.flashFormError("password", "Vui lòng nhập mật khẩu!");
    return res.redirect(referer);
  }

  if (password.length < 6) {
    req.flashFormError("password", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(referer);
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports.forgotPasswordPost = (req, res, next) => {
  const referer = req.get("Referer") || "/auth/password/forgot";
  const { email } = req.body;

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Vui lòng nhập email tài khoản của bạn!");
    return res.redirect(referer);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flashFormError("email", "Email không hợp lệ!");
    return res.redirect(referer);
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports.otpPasswordPost = (req, res, next) => {
  const referer = req.get("Referer") || "/auth/password/otp";
  const { email, otp } = req.body;

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Thiếu thông tin email xác thực!");
    return res.redirect(referer);
  }

  if (!otp || otp.trim() === "") {
    req.flashFormError("otp", "Vui lòng nhập mã OTP!");
    return res.redirect(referer);
  }

  const cleanOtp = otp.trim();
  if (!/^\d+$/.test(cleanOtp)) {
    req.flashFormError("otp", "Mã OTP chỉ được chứa chữ số!");
    return res.redirect(referer);
  }

  if (cleanOtp.length !== 6) {
    req.flashFormError("otp", "Mã OTP phải gồm 6 chữ số!");
    return res.redirect(referer);
  }

  req.body.otp = cleanOtp;
  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports.resetPasswordPost = (req, res, next) => {
  const referer = req.get("Referer") || "/auth/password/reset";
  const { password, confirmPassword } = req.body;

  if (!password || password.trim() === "") {
    req.flashFormError("password", "Vui lòng nhập mật khẩu mới!");
    return res.redirect(referer);
  }

  if (password.length < 6) {
    req.flashFormError("password", "Mật khẩu phải có ít nhất 6 ký tự!");
    return res.redirect(referer);
  }

  if (!confirmPassword || confirmPassword.trim() === "") {
    req.flashFormError("confirmPassword", "Vui lòng xác nhận lại mật khẩu!");
    return res.redirect(referer);
  }

  if (password !== confirmPassword) {
    req.flashFormError("confirmPassword", "Mật khẩu xác nhận không khớp!");
    return res.redirect(referer);
  }

  next();
};
