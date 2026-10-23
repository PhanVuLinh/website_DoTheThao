module.exports.registerPost = (req, res, next) => {
  const referer = req.get("Referer") || "/auth/register";
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || fullName.trim() === "") {
    req.flashFormError("fullName", "Vui lòng nhập đầy đủ họ và tên của bạn!");
    return res.redirect(referer);
  }

  if (fullName.trim().length < 2) {
    req.flashFormError("fullName", "Họ và tên cần có tối thiểu 2 ký tự!");
    return res.redirect(referer);
  }

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Vui lòng nhập địa chỉ email của bạn!");
    return res.redirect(referer);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flashFormError("email", "Địa chỉ email không đúng định dạng (Ví dụ: user@example.com)!");
    return res.redirect(referer);
  }

  if (!password || password.trim() === "") {
    req.flashFormError("password", "Vui lòng nhập mật khẩu tài khoản!");
    return res.redirect(referer);
  }

  if (password.length < 6) {
    req.flashFormError("password", "Mật khẩu bảo mật phải có ít nhất 6 ký tự!");
    return res.redirect(referer);
  }

  if (password !== confirmPassword) {
    req.flashFormError("confirmPassword", "Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập!");
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
    req.flashFormError("email", "Vui lòng nhập địa chỉ email đăng nhập!");
    return res.redirect(referer);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flashFormError("email", "Địa chỉ email không đúng định dạng!");
    return res.redirect(referer);
  }

  if (!password || password.trim() === "") {
    req.flashFormError("password", "Vui lòng nhập mật khẩu đăng nhập!");
    return res.redirect(referer);
  }

  if (password.length < 6) {
    req.flashFormError("password", "Mật khẩu phải chứa tối thiểu 6 ký tự!");
    return res.redirect(referer);
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports.forgotPasswordPost = (req, res, next) => {
  const referer = req.get("Referer") || "/auth/password/forgot";
  const { email } = req.body;

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Vui lòng nhập địa chỉ email tài khoản của bạn!");
    return res.redirect(referer);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flashFormError("email", "Địa chỉ email không đúng định dạng!");
    return res.redirect(referer);
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports.otpPasswordPost = (req, res, next) => {
  const referer = req.get("Referer") || "/auth/password/otp";
  const { email, otp } = req.body;

  if (!email || email.trim() === "") {
    req.flashFormError("email", "Thiếu thông tin địa chỉ email xác thực!");
    return res.redirect(referer);
  }

  if (!otp || otp.trim() === "") {
    req.flashFormError("otp", "Vui lòng nhập mã OTP đã được gửi đến email!");
    return res.redirect(referer);
  }

  const cleanOtp = otp.trim();
  if (!/^\d+$/.test(cleanOtp)) {
    req.flashFormError("otp", "Mã OTP chỉ bao gồm các chữ số!");
    return res.redirect(referer);
  }

  if (cleanOtp.length !== 6) {
    req.flashFormError("otp", "Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số!");
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
    req.flashFormError("password", "Vui lòng nhập mật khẩu mới của bạn!");
    return res.redirect(referer);
  }

  if (password.length < 6) {
    req.flashFormError("password", "Mật khẩu mới phải có tối thiểu 6 ký tự!");
    return res.redirect(referer);
  }

  if (!confirmPassword || confirmPassword.trim() === "") {
    req.flashFormError("confirmPassword", "Vui lòng xác nhận lại mật khẩu mới!");
    return res.redirect(referer);
  }

  if (password !== confirmPassword) {
    req.flashFormError("confirmPassword", "Mật khẩu xác nhận không trùng khớp với mật khẩu mới!");
    return res.redirect(referer);
  }

  next();
};
