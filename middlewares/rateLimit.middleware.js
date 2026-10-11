const rateLimit = require("express-rate-limit");

// Giới hạn tần suất request cho Xác thực (Login / Register / Quên mật khẩu)
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
