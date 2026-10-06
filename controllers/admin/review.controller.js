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
