const Review = require("../../models/review.model");
const Product = require("../../models/product.model");
const moment = require("moment");
const variableCongfig = require("../../config/variable");

module.exports.list = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };

    if (req.query.status) {
      find.status = req.query.status;
    }

    if (req.query.rating) {
      find.rating = parseInt(req.query.rating);
    }

    const reviews = await Review.find(find)
      .populate("product_id", "title slug thumbnail")
      .sort({ createdAt: -1 })
      .lean();

    reviews.forEach((r) => {
      r.createdAtFormat = moment(r.createdAt).format("HH:mm - DD/MM/YYYY");
    });

    res.render("admin/pages/review-list.pug", {
      title: "Quản lý đánh giá sản phẩm",
      reviews: reviews,
      filterStatus: req.query.status || "",
      filterRating: req.query.rating || "",
    });
  } catch (error) {
    console.error("Admin reviews list error:", error);
    req.flash("error", "Lỗi tải danh sách đánh giá!");
    res.redirect(`/${variableCongfig.pathAdmin}/dashboard`);
  }
};

module.exports.changeStatus = async (req, res) => {
  try {
    const { id, status } = req.params;
    await Review.updateOne({ _id: id }, { status: status });
    req.flash("success", "Cập nhật trạng thái đánh giá thành công!");
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/review/list`);
  } catch (error) {
    console.error("Change status review error:", error);
    req.flash("error", "Lỗi cập nhật trạng thái!");
    res.redirect(`/${variableCongfig.pathAdmin}/review/list`);
  }
};

module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Review.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
    req.flash("success", "Đã xóa đánh giá thành công!");
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/review/list`);
  } catch (error) {
    console.error("Delete review error:", error);
    req.flash("error", "Lỗi xóa đánh giá!");
    res.redirect(`/${variableCongfig.pathAdmin}/review/list`);
  }
};

module.exports.toggleFeatured = async (req, res) => {
  try {
    const id = req.params.id;
    const review = await Review.findOne({ _id: id, deleted: false });

    if (!review) {
      req.flash("error", "Đánh giá không tồn tại!");
      return res.redirect(`/${variableCongfig.pathAdmin}/review/list`);
    }

    const nextState = !review.isFeatured;
    await Review.updateOne({ _id: id }, { isFeatured: nextState });

    req.flash(
      "success",
      nextState
        ? "Đã ghim đánh giá lên mục Cảm nhận khách hàng ở Trang chủ!"
        : "Đã bỏ ghim đánh giá khỏi Trang chủ!",
    );
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/review/list`);
  } catch (error) {
    console.error("Toggle featured review error:", error);
    req.flash("error", "Lỗi thay đổi trạng thái ghim trang chủ!");
    res.redirect(`/${variableCongfig.pathAdmin}/review/list`);
  }
};

