const Review = require("../../models/review.model");
const Product = require("../../models/product.model");
const moment = require("moment");
const variableCongfig = require("../../config/variable");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/review/list
module.exports.list = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };

    if (req.query.status) {
      if (req.query.status === "inactive") {
        find.status = { $in: ["inactive", "hidden"] };
      } else {
        find.status = req.query.status;
      }
    }

    if (req.query.keyword) {
      const keyword = req.query.keyword.trim();
      find.$or = [
        { fullName: new RegExp(keyword, "i") },
        { comment: new RegExp(keyword, "i") },
      ];
    }

    if (req.query.rating) {
      find.rating = parseInt(req.query.rating, 10);
    }

    const countReviews = await Review.countDocuments(find);
    const objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 10,
      },
      req.query,
      countReviews,
    );

    const reviews = await Review.find(find)
      .populate("product_id", "title slug thumbnail")
      .sort({ createdAt: -1 })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip)
      .lean();

    reviews.forEach((r) => {
      r.createdAtFormat = moment(r.createdAt).format("HH:mm - DD/MM/YYYY");
      if (r.status === "hidden") r.status = "inactive";
    });

    res.render("admin/pages/review-list.pug", {
      title: "Quản lý đánh giá & nhận xét",
      reviews: reviews,
      filterStatus: req.query.status || "",
      keyword: req.query.keyword || "",
      pagination: objectPagination,
    });
  } catch (error) {
    console.error("Admin reviews list error:", error);
    req.flash("error", "Lỗi tải danh sách đánh giá!");
    res.redirect(`/${variableCongfig.pathAdmin}/dashboard`);
  }
};

// [PATCH] /admin/review/change-status/:status/:id
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

// [PATCH] /admin/review/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
      case "active":
      case "inactive":
        await Review.updateMany(
          { _id: { $in: ids } },
          {
            status: type,
            updatedAt: new Date(),
          },
        );
        req.flash("success", `Đã cập nhật trạng thái ${ids.length} đánh giá!`);
        break;

      case "delete-all":
        await Review.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedAt: new Date(),
          },
        );
        req.flash("success", `Đã xóa ${ids.length} đánh giá!`);
        break;

      default:
        break;
    }

    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/review/list`);
  } catch (error) {
    console.error("Change multi review error:", error);
    req.flash("error", "Lỗi cập nhật nhiều đánh giá!");
    res.redirect(`/${variableCongfig.pathAdmin}/review/list`);
  }
};

// [DELETE] /admin/review/delete/:id
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

// [PATCH] /admin/review/toggle-featured/:id
module.exports.toggleFeatured = async (req, res) => {
  try {
    const id = req.params.id;
    const review = await Review.findById(id);

    if (!review) {
      req.flash("error", "Đánh giá không tồn tại!");
      return res.redirect(`/${variableCongfig.pathAdmin}/review/list`);
    }

    review.isFeatured = !review.isFeatured;
    await review.save();

    req.flash(
      "success",
      review.isFeatured
        ? "Đã ghim đánh giá lên trang chủ thành công!"
        : "Đã hủy ghim đánh giá khỏi trang chủ!",
    );
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/review/list`);
  } catch (error) {
    console.error("Toggle featured review error:", error);
    req.flash("error", "Có lỗi xảy ra khi ghim đánh giá!");
    res.redirect(`/${variableCongfig.pathAdmin}/review/list`);
  }
};
