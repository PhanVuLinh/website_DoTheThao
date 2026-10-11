const Review = require("../../models/review.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const jwtHelper = require("../../helpers/jwt.helper");

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

module.exports.createPost = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      req.flash("error", "Vui lòng đăng nhập để viết đánh giá!");
      return res.redirect(req.get("Referer") || "/");
    }

    const { productId, rating, comment } = req.body;

    if (!productId || !comment) {
      req.flash("error", "Vui lòng nhập đầy đủ nội dung đánh giá!");
      return res.redirect(req.get("Referer") || "/");
    }

    const product = await Product.findOne({ _id: productId, deleted: false });
    if (!product) {
      req.flash("error", "Sản phẩm không tồn tại!");
      return res.redirect(req.get("Referer") || "/");
    }

    // Kiểm tra xem người dùng đã từng mua sản phẩm này chưa (Verified Buyer)
    const orderHistory = await Order.findOne({
      user_id: user.id,
      "products.product_id": productId,
      deleted: false,
    });

    const isVerifiedBuyer = !!orderHistory;

    // Lấy link ảnh từ Cloudinary upload
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) images.push(file.path);
      });
    }

    const newReview = new Review({
      user_id: user.id,
      product_id: productId,
      order_id: orderHistory ? orderHistory._id : null,
      fullName: user.fullName || "Khách hàng SportStore",
      avatar: user.avatar || "/client/assets/images/default-avatar.png",
      rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
      comment: comment.trim(),
      images: images,
      isVerifiedBuyer: isVerifiedBuyer,
      status: "active",
    });

    await newReview.save();

    req.flash("success", "Đánh giá sản phẩm thành công! Cảm ơn phản hồi của bạn.");
    return res.redirect(`/product/detail/${product.slug}#reviews-section`);
  } catch (error) {
    console.error("Create Review Error:", error);
    req.flash("error", "Gửi đánh giá không thành công, vui lòng thử lại!");
    return res.redirect(req.get("Referer") || "/");
  }
};
