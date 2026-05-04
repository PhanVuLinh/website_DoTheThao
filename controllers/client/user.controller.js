const moment = require("moment");

const User = require("../../models/user.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
module.exports.profile = (req, res) => {
  res.render("client/pages/user-profile.pug", {
    title: "Thông tin cá nhân",
  });
};

module.exports.profilePatch = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userInfo = await User.findOne({ token: token });
    if (!userInfo) {
      req.flash("error", "Không tìm thấy người dùng!");
      res.redirect("/");
    }
    await User.updateOne({ _id: userInfo.id }, req.body);
    req.flash("success", "Cập nhật tài khoản thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    console.error(error);
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect("/user/profile");
  }
};

module.exports.orderHistory = async (req, res) => {
  try {
    const user = await User.findOne({
      token: req.cookies.token,
      deleted: false,
    });

    if (!user) {
      return res.redirect("/user/login");
    }

    const orders = await Order.find({
      user_id: user.id,
      deleted: false,
    }).sort({ createdAt: "desc" });

    for (const item of orders) {
      item.createdAtFormat = moment(item.createdAt).format(
        "HH:mm - DD/MM/YYYY",
      );
      item.totalPriceFormat = item.total.toLocaleString("vi-VN");

      if (item.products.length > 0) {
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
    });
  } catch (error) {
    console.log("Lỗi load lịch sử đơn hàng:", error);
    req.flash("error", "Lỗi hệ thống khi tải lịch sử đơn hàng");
    res.redirect("/");
  }
};

module.exports.changePassword = (req, res) => {
  res.render("client/pages/user-change-password.pug", {
    title: "Đổi mật cá nhân",
  });
};
