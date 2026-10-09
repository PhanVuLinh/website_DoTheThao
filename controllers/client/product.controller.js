const moment = require("moment");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Review = require("../../models/review.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const jwtHelper = require("../../helpers/jwt.helper");

const productPriceHelper = require("../../helpers/getPriceNew.helper.js");

module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const productDetail = await Product.findOne({
      status: "active",
      deleted: false,
      slug: slug,
    }).lean();

    if (!productDetail) {
      req.flash("error", "Sản phẩm không tồn tại");
      return res.redirect("/");
    }

    // Đảm bảo luôn có mảng ảnh hiển thị (kết hợp thumbnail và images)
    let images = [];
    if (Array.isArray(productDetail.images) && productDetail.images.length > 0) {
      images = productDetail.images.filter(
        (img) => img && typeof img === "string" && img.trim() !== "",
      );
    }
    if (productDetail.thumbnail && !images.includes(productDetail.thumbnail)) {
      images.unshift(productDetail.thumbnail);
    }
    productDetail.images = images;

    // Breadcrumb
    const breadcrumb = {
      title: productDetail.title,
      list: [
        {
          link: "/",
          title: "Trang Chủ",
        },
      ],
    };

    if (productDetail.category_id) {
      const category = await Category.findOne({
        _id: productDetail.category_id,
        deleted: false,
        status: "active",
      }).lean();

      if (category) {
        if (category.parent_id) {
          const parentCategory = await Category.findOne({
            _id: category.parent_id,
            deleted: false,
            status: "active",
          }).lean();

          if (parentCategory) {
            breadcrumb.list.push({
              link: `/category/${parentCategory.slug}`,
              title: parentCategory.title,
            });
          }
        }
        breadcrumb.list.push({
          link: `/category/${category.slug}`,
          title: category.title,
        });
      }
    }

    breadcrumb.list.push({
      link: `/product/detail/${slug}`,
      title: productDetail.title,
    });

    const newProductDetail = productPriceHelper.priceNewOne(productDetail);

    // Lấy danh sách đánh giá của sản phẩm
    const reviews = await Review.find({
      product_id: productDetail._id,
      deleted: false,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean();

    let totalRatingSum = 0;
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((r) => {
      totalRatingSum += r.rating;
      if (ratingBreakdown[r.rating] !== undefined) {
        ratingBreakdown[r.rating]++;
      }
      r.createdAtFormat = moment(r.createdAt).format("DD/MM/YYYY");
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : "5.0";

    // Kiểm tra xem người dùng hiện tại có đủ điều kiện đánh giá không
    let isUserLoggedIn = false;
    let isVerifiedBuyer = false;
    const token = req.cookies.tokenUser || req.cookies.token;
    if (token) {
      const decoded = jwtHelper.verifyToken(token);
      let userId = decoded ? decoded.userId : null;
      if (!userId) {
        const u = await User.findOne({ token: token, deleted: false }).select("_id");
        if (u) userId = u.id;
      }

      if (userId) {
        isUserLoggedIn = true;
        const purchaseRecord = await Order.findOne({
          user_id: userId,
          "products.product_id": productDetail._id.toString(),
          deleted: false,
        });
        if (purchaseRecord) {
          isVerifiedBuyer = true;
        }
      }
    }

    res.render("client/pages/product-detail.pug", {
      title: newProductDetail.title || "Chi tiết sản phẩm",
      product: newProductDetail,
      breadcrumb: breadcrumb,
      productDetail: newProductDetail,
      reviews: reviews,
      totalReviews: totalReviews,
      avgRating: avgRating,
      ratingBreakdown: ratingBreakdown,
      isUserLoggedIn: isUserLoggedIn,
      isVerifiedBuyer: isVerifiedBuyer,
    });
  } catch (error) {
    console.error("Product detail error:", error);
    req.flash("error", "Sản phẩm không tồn tại");
    return res.redirect("/");
  }
};

