const moment = require("moment");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Brand = require("../../models/brand.model");
const Review = require("../../models/review.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const jwtHelper = require("../../helpers/jwt.helper");
const paginationHelper = require("../../helpers/pagination.helper");
const regexHelper = require("../../helpers/regex.helper");
const productPriceHelper = require("../../helpers/getPriceNew.helper.js");

module.exports.index = async (req, res) => {
  try {
    const find = {
      deleted: false,
      status: "active",
    };

    // 1. Lọc theo Khoảng Giá (Presets & Custom Min/Max)
    if (req.query.price) {
      if (req.query.price === "under-500k") {
        find.price = { $lt: 500000 };
      } else if (req.query.price === "500k-to-1m") {
        find.price = { $gte: 500000, $lte: 1000000 };
      } else if (req.query.price === "1m-to-2m") {
        find.price = { $gte: 1000000, $lte: 2000000 };
      } else if (req.query.price === "2m-to-3m") {
        find.price = { $gte: 2000000, $lte: 3000000 };
      } else if (req.query.price === "over-3m") {
        find.price = { $gt: 3000000 };
      } else if (req.query.price === "under-1m") {
        find.price = { $lt: 1000000 };
      } else if (req.query.price === "1m-to-3m") {
        find.price = { $gte: 1000000, $lte: 3000000 };
      }
    } else if (req.query.priceMin || req.query.priceMax) {
      find.price = {};
      if (req.query.priceMin && !isNaN(Number(req.query.priceMin))) {
        find.price.$gte = Number(req.query.priceMin);
      }
      if (req.query.priceMax && !isNaN(Number(req.query.priceMax))) {
        find.price.$lte = Number(req.query.priceMax);
      }
    }

    // 2. Lọc theo Thương Hiệu (Multi-Brand)
    if (req.query.brand) {
      const brands = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
      const validBrands = brands.filter((b) => b && typeof b === "string" && b.trim() !== "");
      if (validBrands.length > 0) {
        find.brand = {
          $in: validBrands.map((b) => new RegExp(regexHelper.escapeRegex(String(b).trim()), "i")),
        };
      }
    }

    // 3. Lọc theo Kích Cỡ Còn Hàng (In-Stock Size Filter: stock > 0)
    if (req.query.size) {
      const sizes = Array.isArray(req.query.size) ? req.query.size : [req.query.size];
      const validSizes = sizes.filter((s) => s && typeof s === "string" && s.trim() !== "");
      if (validSizes.length > 0) {
        const sizeRegexes = validSizes.map(
          (s) => new RegExp(`(^|\\b|size[:\\s]*)${regexHelper.escapeRegex(String(s).trim())}(\\b|$)`, "i")
        );
        find.sizes = {
          $elemMatch: {
            size: { $in: sizeRegexes },
            stock: { $gt: 0 },
          },
        };
      }
    }

    // 4. Lọc Tình Trạng Hàng: Chỉ Hiện Sản Phẩm Còn Hàng
    if (req.query.inStock === "1" || req.query.inStock === "true") {
      if (!find.sizes) {
        find.sizes = {
          $elemMatch: {
            stock: { $gt: 0 },
          },
        };
      }
    }

    const rawProducts = await Product.find(find).lean();
    let productList = productPriceHelper.priceNewProduct(rawProducts);

    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        productList.sort((a, b) => a.priceNew - b.priceNew);
      } else if (req.query.sort === "price-desc") {
        productList.sort((a, b) => b.priceNew - a.priceNew);
      } else if (req.query.sort === "newest") {
        productList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else {
      productList.sort((a, b) => (b.position || 0) - (a.position || 0));
    }

    const countProduct = productList.length;
    const objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 12,
      },
      req.query,
      countProduct,
    );

    const paginatedProducts = productList.slice(
      objectPagination.skip,
      objectPagination.skip + objectPagination.limitItems,
    );

    const allChildCategories = await Category.find({
      deleted: false,
      status: "active",
    }).sort({ position: "desc" });

    const rawBrands = await Product.distinct("brand", {
      deleted: false,
      status: "active",
    });
    const brandDocs = await Brand.find({
      deleted: false,
      status: "active",
    }).select("title");
    const distinctBrandSet = new Set(
      rawBrands.concat(brandDocs.map((b) => b.title)).filter((b) => b && typeof b === "string" && b.trim() !== ""),
    );
    const availableBrands = Array.from(distinctBrandSet);

    // Chuẩn hóa danh sách size thể thao (Giày & Quần áo)
    const canonicalSizes = {
      shoes: ["38", "39", "40", "41", "42", "43", "44"],
      apparel: ["S", "M", "L", "XL", "XXL"],
    };

    // Tạo danh sách tag bộ lọc đang hoạt động (Active Filter Pills)
    const activeFilters = [];
    if (req.query.brand) {
      const brands = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
      brands.forEach((b) => {
        if (b && String(b).trim()) {
          activeFilters.push({ key: "brand", value: b, label: `Hãng: ${b}` });
        }
      });
    }

    if (req.query.size) {
      const sizes = Array.isArray(req.query.size) ? req.query.size : [req.query.size];
      sizes.forEach((s) => {
        if (s && String(s).trim()) {
          activeFilters.push({ key: "size", value: s, label: `Size: ${s} (Còn hàng)` });
        }
      });
    }

    if (req.query.price) {
      const priceLabels = {
        "under-500k": "Giá: Dưới 500.000đ",
        "500k-to-1m": "Giá: 500K - 1 Triệu",
        "1m-to-2m": "Giá: 1 - 2 Triệu",
        "2m-to-3m": "Giá: 2 - 3 Triệu",
        "over-3m": "Giá: Trên 3 Triệu",
        "under-1m": "Giá: Dưới 1 Triệu",
        "1m-to-3m": "Giá: 1 - 3 Triệu",
      };
      if (priceLabels[req.query.price]) {
        activeFilters.push({
          key: "price",
          value: req.query.price,
          label: priceLabels[req.query.price],
        });
      }
    } else if (req.query.priceMin || req.query.priceMax) {
      const minText = req.query.priceMin ? `${Number(req.query.priceMin).toLocaleString("vi-VN")}đ` : "0đ";
      const maxText = req.query.priceMax ? `${Number(req.query.priceMax).toLocaleString("vi-VN")}đ` : "Tối đa";
      activeFilters.push({
        key: "priceCustom",
        value: "custom",
        label: `Giá: ${minText} - ${maxText}`,
      });
    }

    if (req.query.inStock === "1" || req.query.inStock === "true") {
      activeFilters.push({
        key: "inStock",
        value: "1",
        label: "Chỉ hiện sản phẩm còn hàng",
      });
    }

    const breadcrumb = {
      title: "Tất Cả Sản Phẩm",
      list: [
        { link: "/", title: "Trang Chủ" },
        { link: "/product", title: "Tất Cả Sản Phẩm" },
      ],
    };

    res.render("client/pages/product-list.pug", {
      title: "Tất cả sản phẩm thể thao",
      breadcrumb: breadcrumb,
      productCategory: paginatedProducts,
      pagination: objectPagination,
      allChildCategories: allChildCategories,
      availableBrands: availableBrands,
      canonicalSizes: canonicalSizes,
      activeFilters: activeFilters,
      queryPrice: req.query.price,
      queryPriceMin: req.query.priceMin,
      queryPriceMax: req.query.priceMax,
      queryBrand: req.query.brand,
      querySize: req.query.size,
      queryInStock: req.query.inStock,
      querySort: req.query.sort,
      totalCount: countProduct,
      category: null,
    });
  } catch (error) {
    console.error("Product index error:", error);
    req.flash("error", "Có lỗi xảy ra khi tải danh sách sản phẩm");
    res.redirect("/");
  }
};

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

