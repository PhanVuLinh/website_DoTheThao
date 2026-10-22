const rateLimit = require("express-rate-limit");
const variableConfig = require("../config/variable");

// Giới hạn tần suất request cho Xác thực Client (Login / Register / Quên mật khẩu)
module.exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 15, // Tối đa 15 lần thử
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Bạn đã thao tác quá nhiều lần! Vui lòng thử lại sau 15 phút.",
  },
  handler: (req, res, next, options) => {
    req.flash("error", "Hệ thống phát hiện quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút!");
    return res.redirect(req.get("Referer") || "/auth/login");
  },
});

// Giới hạn tần suất đăng nhập Admin (Chống Brute-Force tài khoản quản trị)
module.exports.adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // Tối đa 10 lần thử đăng nhập sai
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    req.flash("error", "Phát hiện quá nhiều yêu cầu đăng nhập quản trị! Vui lòng thử lại sau 15 phút.");
    return res.redirect(`/${variableConfig.pathAdmin}/auth/login`);
  },
});

// Giới hạn tần suất đặt hàng (Chống spam đơn hàng ảo)
module.exports.orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 10, // Tối đa 10 lần gửi đơn
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    req.flash("error", "Bạn đang thao tác quá nhanh. Vui lòng đợi 5 phút trước khi tiếp tục đặt hàng!");
    return res.redirect("/cart");
  },
});

// Giới hạn gửi đánh giá sản phẩm (Chống spam review & tràn bộ nhớ Cloudinary)
module.exports.reviewLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 5, // Tối đa 5 lượt đánh giá
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    req.flash("error", "Bạn đang gửi đánh giá quá nhanh. Vui lòng thử lại sau ít phút!");
    return res.redirect(req.get("Referer") || "/");
  },
});

// Giới hạn gửi form liên hệ (Chống spam hộp thư)
module.exports.contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lượt liên hệ
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    req.flash("error", "Bạn đã gửi quá nhiều tin nhắn liên hệ. Vui lòng đợi 15 phút!");
    return res.redirect(req.get("Referer") || "/contact");
  },
});
