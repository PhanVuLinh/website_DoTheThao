const moment = require("moment");

const User = require("../../models/user.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const jwtHelper = require("../../helpers/jwt.helper");
const passwordHelper = require("../../helpers/password.helper");

const getAuthUser = async (req) => {
  const token = req.cookies.tokenUser || req.cookies.token;
  if (!token) return null;

  const decoded = jwtHelper.verifyToken(token);
  if (decoded && decoded.userId) {
    const user = await User.findOne({ _id: decoded.userId, deleted: false, status: "active" });
    if (user) return user;
  }
  return await User.findOne({ token: token, deleted: false, status: "active" });
};

module.exports.profile = async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    req.flash("error", "Vui lòng đăng nhập để xem hồ sơ!");
    return res.redirect("/auth/login");
  }

  res.render("client/pages/user-profile.pug", {
    title: "Thông tin cá nhân",
    user: user,
  });
};

module.exports.profilePatch = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      req.flash("error", "Không tìm thấy người dùng hoặc phiên đăng nhập đã hết hạn!");
      return res.redirect("/auth/login");
    }

    // Chống Mass Assignment: Chỉ cho phép cập nhật các trường an toàn
    const updateData = {};
    if (typeof req.body.fullName === "string") updateData.fullName = req.body.fullName.trim();
    if (typeof req.body.phone === "string") updateData.phone = req.body.phone.trim();
    if (typeof req.body.address === "string") updateData.address = req.body.address.trim();

    await User.updateOne({ _id: user.id }, updateData);

    req.flash("success", "Cập nhật tài khoản thành công!");
    return res.redirect(req.get("Referer") || "/user/profile");
  } catch (error) {
    console.error("Profile Patch Error:", error);
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
    return res.redirect(req.get("Referer") || "/user/profile");
  }
};

module.exports.orderHistory = async (req, res) => {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      req.flash("error", "Vui lòng đăng nhập để xem lịch sử đơn hàng!");
      return res.redirect("/auth/login");
    }

    const orders = await Order.find({
      user_id: user.id,
      deleted: false,
    }).sort({ createdAt: "desc" });

    for (const item of orders) {
      item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
      item.totalPriceFormat = (item.total || 0).toLocaleString("vi-VN");

      if (item.products && item.products.length > 0) {
        const product = item.products[0];
        const productInfo = await Product.findOne({
          _id: product.product_id,
          deleted: false,
        }).select("title thumbnail slug");
        product.productInfo = productInfo;
      }
    }

    res.render("client/pages/order-history.pug", {
      title: "Lịch sử đơn hàng",
      orders: orders,
      user: user,
    });
  } catch (error) {
    console.error("Lỗi load lịch sử đơn hàng:", error);
    req.flash("error", "Lỗi hệ thống khi tải lịch sử đơn hàng");
    return res.redirect("/");
  }
};

module.exports.orderHistoryDetail = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const user = await getAuthUser(req);

    if (!user) {
      req.flash("error", "Vui lòng đăng nhập!");
      return res.redirect("/auth/login");
    }

    // IDOR Check: Đảm bảo chỉ tìm đơn hàng thuộc về chính user đang đăng nhập
    const order = await Order.findOne({
      _id: orderId,
      user_id: user.id,
      deleted: false,
    });

    if (!order) {
      req.flash("error", "Đơn hàng không tồn tại hoặc bạn không có quyền xem!");
      return res.redirect("/user/order-history");
    }

    order.createdAtFormat = moment(order.createdAt).format("HH:mm - DD/MM/YYYY");

    for (const item of order.products) {
      const infoProduct = await Product.findOne({
        _id: item.product_id,
        deleted: false,
      }).select("title thumbnail slug");

      if (infoProduct) {
        item.productInfo = infoProduct;
      } else {
        item.productInfo = {
          title: "Sản phẩm không còn tồn tại",
          thumbnail: "/images/default-product.png",
          slug: "",
        };
      }
    }

    res.render("client/pages/order-history-detail.pug", {
      title: "Chi tiết lịch sử đơn hàng",
      user: user,
      order: order,
    });
  } catch (error) {
    console.error("Lỗi load chi tiết đơn hàng:", error);
    req.flash("error", "Lỗi hệ thống khi tải lịch sử đơn hàng");
    return res.redirect("/user/order-history");
  }
};

module.exports.changePassword = async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    req.flash("error", "Vui lòng đăng nhập!");
    return res.redirect("/auth/login");
  }
  res.render("client/pages/user-change-password.pug", {
    title: "Đổi mật khẩu cá nhân",
    user: user,
  });
};

// Hoàn thiện chức năng Đổi mật khẩu cá nhân User
module.exports.changePasswordPatch = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      req.flash("error", "Vui lòng đăng nhập!");
      return res.redirect("/auth/login");
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      req.flash("error", "Vui lòng nhập đầy đủ các trường thông tin!");
      return res.redirect(req.get("Referer") || "/user/change-password");
    }

    if (newPassword.length < 6) {
      req.flash("error", "Mật khẩu mới phải có ít nhất 6 ký tự!");
      return res.redirect(req.get("Referer") || "/user/change-password");
    }

    if (newPassword !== confirmPassword) {
      req.flash("error", "Xác nhận mật khẩu mới không khớp!");
      return res.redirect(req.get("Referer") || "/user/change-password");
    }

    const isMatch = await passwordHelper.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      req.flash("error", "Mật khẩu hiện tại không chính xác!");
      return res.redirect(req.get("Referer") || "/user/change-password");
    }

    const hashedPassword = await passwordHelper.hashPassword(newPassword);

    // Cấp lại JWT token mới để vô hiệu hóa token cũ
    const newToken = jwtHelper.generateToken({
      userId: user.id,
      email: user.email,
    });

    await User.updateOne(
      { _id: user.id },
      {
        password: hashedPassword,
        token: newToken,
      },
    );

    const cookieOptions = {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };
    res.cookie("tokenUser", newToken, cookieOptions);
    res.cookie("token", newToken, cookieOptions);

    req.flash("success", "Đổi mật khẩu thành công!");
    return res.redirect(req.get("Referer") || "/user/change-password");
  } catch (error) {
    console.error("Change Password Error:", error);
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
    return res.redirect(req.get("Referer") || "/user/change-password");
  }
};
