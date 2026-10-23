const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Cart = require("../../models/cart.model");

const generateHelper = require("../../helpers/generate.helper");
const sendMailHelper = require("../../helpers/sendMail.helper");
const jwtHelper = require("../../helpers/jwt.helper");
const passwordHelper = require("../../helpers/password.helper");

module.exports.login = async (req, res) => {
  const token = req.cookies.tokenUser || req.cookies.token;
  if (token && jwtHelper.verifyToken(token)) {
    return res.redirect("/");
  }
  res.render("client/pages/user-login.pug", {
    title: "Đăng nhập",
    oldData: req.flash("oldData")[0] || {},
  });
};

module.exports.loginPost = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    const user = await User.findOne({
      email: email,
      deleted: false,
    });

    if (!user) {
      req.flashFormError("email", "Địa chỉ email này chưa được đăng ký trong hệ thống!");
      return res.redirect(req.get("Referer") || "/auth/login");
    }

    const isMatch = await passwordHelper.comparePassword(password, user.password);
    if (!isMatch) {
      req.flashFormError("password", "Mật khẩu không chính xác, vui lòng thử lại!");
      return res.redirect(req.get("Referer") || "/auth/login");
    }

    if (user.status === "inactive") {
      req.flashFormError("email", "Tài khoản của bạn hiện đang bị tạm khóa. Vui lòng liên hệ CSKH!");
      return res.redirect(req.get("Referer") || "/auth/login");
    }

    // Tự động nâng cấp mật khẩu sang bcryptjs nếu trước đó lưu bằng MD5
    if (!passwordHelper.isBcryptHash(user.password)) {
      user.password = await passwordHelper.hashPassword(password);
      await user.save();
    }

    // Tạo JWT token an toàn
    const token = jwtHelper.generateToken({
      userId: user.id,
      email: user.email,
    });

    // Cập nhật token trong database
    await User.updateOne({ _id: user.id }, { token: token });

    const cookieOptions = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    res.cookie("tokenUser", token, cookieOptions);
    res.cookie("token", token, cookieOptions); // Hỗ trợ tương thích ngược

    req.flash("success", "Đăng nhập thành công! Chào mừng bạn quay trở lại.");

    if (req.cookies.cartId) {
      await Cart.updateOne({ _id: req.cookies.cartId }, { user_id: user.id });
    }

    let redirectUrl = "/";
    if (req.session.returnTo) {
      redirectUrl = req.session.returnTo;
      delete req.session.returnTo;
    }
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Login Error:", error);
    req.flash("error", "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau!");
    return res.redirect(req.get("Referer") || "/auth/login");
  }
};

module.exports.register = async (req, res) => {
  res.render("client/pages/user-register.pug", {
    title: "Đăng ký",
  });
};

module.exports.registerPost = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
    const password = req.body.password;

    const existEmail = await User.findOne({ email: email, deleted: false });
    if (existEmail) {
      req.flashFormError("email", "Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác!");
      return res.redirect(req.get("Referer") || "/auth/register");
    }

    const hashedPassword = await passwordHelper.hashPassword(password);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      status: "active",
    });

    // Tạo JWT token cho tài khoản mới
    const token = jwtHelper.generateToken({
      userId: newUser.id,
      email: newUser.email,
    });
    newUser.token = token;

    await newUser.save();

    req.flash("success", "Đăng ký tài khoản thành công! Vui lòng đăng nhập để bắt đầu mua sắm.");
    return res.redirect("/auth/login");
  } catch (error) {
    console.error("Register Error:", error);
    req.flash("error", "Không thể hoàn tất đăng ký vào lúc này. Vui lòng thử lại sau!");
    return res.redirect(req.get("Referer") || "/auth/register");
  }
};

module.exports.logout = async (req, res) => {
  if (req.cookies.cartId) {
    await Cart.updateOne(
      { _id: req.cookies.cartId },
      { $unset: { user_id: "" } },
    );
  }
  res.clearCookie("tokenUser");
  res.clearCookie("token");
  req.flash("success", "Bạn đã đăng xuất tài khoản thành công. Hẹn gặp lại quý khách!");
  res.redirect("/");
};

module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user-forgot-password.pug", {
    title: "Lấy lại mật khẩu",
  });
};

module.exports.forgotPasswordPost = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const user = await User.findOne({
      email: email,
      deleted: false,
      status: "active",
    });

    if (!user) {
      req.flashFormError("email", "Địa chỉ email không tồn tại trong hệ thống!");
      return res.redirect(req.get("Referer") || "/auth/forgot-password");
    }

    if (user.status === "inactive") {
      req.flashFormError("email", "Tài khoản liên kết với email này hiện đang bị khóa!");
      return res.redirect(req.get("Referer") || "/auth/forgot-password");
    }

    // Xóa các OTP cũ chưa dùng của email này
    await ForgotPassword.deleteMany({ email: email });

    const otp = generateHelper.generateRandomNumber(6);
    const objectForgotPassword = {
      email: email,
      otp: otp,
      expireAt: new Date(Date.now() + 3 * 60 * 1000), // Hết hạn sau 3 phút
    };

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    // Gửi mã OTP qua email
    const subject = "Mã OTP để đặt lại mật khẩu - TiTi Sport";
    const html = `
      <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
        <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">
          <div style="background:#007bff; color:#fff; padding:15px; text-align:center;">
            <h2 style="margin:0;">TiTi Sport</h2>
          </div>
          <div style="padding:20px; color:#333;">
            <p>Xin chào,</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu từ bạn.</p>
            <p>Mã OTP của bạn là:</p>
            <div style="text-align:center; font-size:28px; font-weight:bold; letter-spacing:5px; color:#007bff; margin:20px 0;">
              ${otp}
            </div>
            <p>Mã này sẽ hết hạn sau <b>3 phút</b>.</p>
            <p style="color:#d9534f;">Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
            <br>
            <p>Trân trọng,<br><b>Đội ngũ TiTi Sport</b></p>
          </div>
        </div>
      </div>
    `;
    sendMailHelper.sendMail(email, subject, html);

    return res.redirect(`/auth/otp-password?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error("Forgot Password Error:", error);
    req.flash("error", "Có lỗi xảy ra khi tạo mã xác thực. Vui lòng thử lại sau!");
    return res.redirect(req.get("Referer") || "/auth/forgot-password");
  }
};

module.exports.otpPassword = async (req, res) => {
  // Sửa lỗi rò rỉ biến toàn cục email
  const email = typeof req.query.email === "string" ? req.query.email.trim() : "";

  res.render("client/pages/user-otp-password.pug", {
    title: "Nhập mã OTP",
    email: email,
  });
};

module.exports.otpPasswordPost = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";

    const forgotPassword = await ForgotPassword.findOne({
      email: email,
      otp: otp,
    });

    if (!forgotPassword) {
      req.flash("error", "Mã OTP không chính xác hoặc đã hết thời gian hiệu lực (3 phút)!");
      return res.redirect(req.get("Referer") || "/auth/forgot-password");
    }

    // Đánh dấu email đã verify OTP vào session
    req.session.emailReset = email;

    // Xóa OTP ngay sau khi xác thực thành công (One-Time Use)
    await ForgotPassword.deleteOne({ _id: forgotPassword.id });

    return res.redirect("/auth/reset-password");
  } catch (error) {
    console.error("OTP Error:", error);
    req.flash("error", "Có lỗi xảy ra khi kiểm tra OTP. Vui lòng thử lại sau!");
    return res.redirect(req.get("Referer") || "/auth/forgot-password");
  }
};

module.exports.resetPassword = async (req, res) => {
  if (!req.session.emailReset) {
    req.flash("error", "Vui lòng nhập đúng mã OTP xác thực trước khi đổi mật khẩu!");
    return res.redirect("/auth/forgot-password");
  }
  res.render("client/pages/user-reset-password.pug", {
    title: "Đổi mật khẩu",
  });
};

module.exports.resetPasswordPost = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.session.emailReset;

    if (!email) {
      req.flash("error", "Phiên làm việc đã hết hạn. Vui lòng thực hiện lại yêu cầu quên mật khẩu!");
      return res.redirect("/auth/forgot-password");
    }

    const hashedPassword = await passwordHelper.hashPassword(password);

    // Cấp lại JWT token mới để vô hiệu hóa token cũ nếu bị lộ
    const userUpdated = await User.findOne({ email: email, deleted: false });
    const newToken = jwtHelper.generateToken({
      userId: userUpdated ? userUpdated.id : undefined,
      email: email,
    });

    await User.updateOne(
      { email: email },
      {
        password: hashedPassword,
        token: newToken,
      },
    );

    delete req.session.emailReset;
    req.flash("success", "Đặt lại mật khẩu mới thành công! Vui lòng đăng nhập bằng mật khẩu mới.");
    return res.redirect("/auth/login");
  } catch (error) {
    console.error("Reset Password Error:", error);
    req.flash("error", "Không thể cập nhật mật khẩu vào lúc này. Vui lòng thử lại sau!");
    return res.redirect(req.get("Referer") || "/auth/forgot-password");
  }
};
