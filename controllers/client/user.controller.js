const md5 = require("md5");
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Cart = require("../../models/cart.model");

const generateHelper = require("../../helpers/generate.helper");
const sendMailHelper = require("../../helpers/sendMail.helper");

module.exports.login = async (req, res) => {
  res.render("client/pages/user-login.pug", {
    title: "Đăng nhập",
  });
};

module.exports.loginPost = async (req, res) => {
  try {
    const email = req.body.email;
    const password = md5(req.body.password);
    const user = await User.findOne({
      email: email,
      deleted: false,
    });

    if (!user) {
      req.flash("error", "Email không tồn tại");
      return res.redirect(req.get("Referer"));
    }
    if (password !== user.password) {
      req.flash("error", "Sai mật khẩu");
      return res.redirect(req.get("Referer"));
    }

    if (user.status === "inactive") {
      req.flash("error", "Tài khoản đang bị khóa");
      return res.redirect(req.get("Referer"));
    }

    res.cookie("token", user.token);
    req.flash("success", "Đăng nhập thành công!");

    await Cart.updateOne({ _id: req.cookies.cartId }, { user_id: user.id });

    let redirectUrl = "/";
    if (req.session.returnTo) {
      redirectUrl = req.session.returnTo;
      delete req.session.returnTo;
    }
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.register = async (req, res) => {
  res.render("client/pages/user-register.pug", {
    title: "Đăng ký",
  });
};

module.exports.registerPost = async (req, res) => {
  try {
    const existEmail = await User.findOne({ email: req.body.email });
    if (existEmail) {
      req.flash("error", "Email đã tồn tại");
      return res.redirect(req.get("Referer"));
    }

    delete req.body.confirmPassword;
    req.body.password = md5(req.body.password);

    const newUser = new User(req.body);
    await newUser.save();
    req.flash("success", "Tạo tài khoản thành công");
    res.redirect("/user/login");
  } catch (error) {
    console.error(error);
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.logout = async (req, res) => {
  await Cart.updateOne(
    { _id: req.cookies.cartId },
    { $unset: { user_id: "" } },
  );
  res.clearCookie("token");
  res.redirect("/");
};

module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user-forgot-password.pug", {
    title: "Lấy lại mật khẩu",
  });
};

module.exports.forgotPasswordPost = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({
      email: email,
      deleted: false,
      status: "active",
    });

    if (!user) {
      req.flash("error", "Email không tồn tại");
      return res.redirect(req.get("Referer"));
    }

    if (user.status === "inactive") {
      req.flash("error", "Tài khoản đang bị khóa");
      return res.redirect(req.get("Referer"));
    }

    const otp = generateHelper.generateRandomNumber(6);
    const objectForgotPassword = {
      email: email,
      otp: otp,
      expireAt: Date.now(),
    };

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();
    //gởi mã otp
    const subject = "Mã OTP để đặt lại mật khẩu";
    const html = `
      <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
        <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <div style="background:#007bff; color:#fff; padding:15px; text-align:center;">
            <h2 style="margin:0;">TiTi Sport</h2>
          </div>

          <!-- Body -->
          <div style="padding:20px; color:#333;">
            <p>Xin chào,</p>

            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu từ bạn.</p>

            <p>Mã OTP của bạn là:</p>

            <div style="
              text-align:center;
              font-size:28px;
              font-weight:bold;
              letter-spacing:5px;
              color:#007bff;
              margin:20px 0;
            ">
              ${otp}
            </div>

            <p>Mã này sẽ hết hạn sau <b>3 phút</b>.</p>

            <p style="color:#d9534f;">
              Vui lòng không chia sẻ mã này với bất kỳ ai.
            </p>

            <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>

            <br>

            <p>Trân trọng,<br><b>Đội ngũ TiTi Sport</b></p>
          </div>

          <!-- Footer -->
          <div style="background:#f1f1f1; padding:10px; text-align:center; font-size:12px; color:#777;">
            © 2026 TiTi Sport
          </div>

        </div>
      </div>
      `;
    sendMailHelper.sendMail(email, subject, html);

    res.redirect(`/user/otp-password?email=${email}`);
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.otpPassword = async (req, res) => {
  email = req.query.email;

  res.render("client/pages/user-otp-password.pug", {
    title: "Nhập mã OTP",
    email: email,
  });
};

module.exports.otpPasswordPost = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;

    const forgotPassword = await ForgotPassword.findOne({
      email: email,
      otp: otp,
    });

    if (!forgotPassword) {
      req.flash("error", "OTP không chính xác");
      return res.redirect(req.get("Referer"));
    }

    const user = await User.findOne({
      email: email,
      deleted: false,
      status: "active",
    });
    req.session.emailReset = email;
    res.redirect(`/user/reset-password`);
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user-reset-password.pug", {
    title: "Đổi mật khẩu",
  });
};

module.exports.resetPasswordPost = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.session.emailReset;
    if (!email) {
      req.flash("error", "Có lỗi xảy ra!");
      return res.redirect("/user/forgot-password");
    }

    await User.updateOne({ email: email }, { password: md5(password) });
    delete req.session.emailReset;
    req.flash("success", "Đổi mật khẩu thành công");
    res.redirect("/user/login");
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect(req.get("Referer"));
  }
};
