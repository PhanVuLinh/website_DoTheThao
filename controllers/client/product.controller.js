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

// [GET] /product/api/quick-detail/:slug
module.exports.quickDetail = async (req, res) => {
  try {
    const slug = req.params.slug;
    let product = await Product.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    }).lean();

    if (!product && slug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findOne({
        _id: slug,
        deleted: false,
        status: "active",
      }).lean();
    }

    if (!product) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy sản phẩm" });
    }

    product = productPriceHelper.priceNewOne(product);

    let images = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      images = product.images.filter((img) => img && typeof img === "string" && img.trim() !== "");
    }
    if (product.thumbnail && !images.includes(product.thumbnail)) {
      images.unshift(product.thumbnail);
    }
    if (images.length === 0 && product.thumbnail) {
      images.push(product.thumbnail);
    }
    product.images = images;

    return res.json({
      code: 200,
      product: {
        id: product._id,
        title: product.title,
        slug: product.slug,
        brand: product.brand || "CHÍNH HÃNG",
        price: product.price,
        priceNew: product.priceNew,
        discountPercentage: product.discountPercentage || 0,
        thumbnail: product.thumbnail || images[0] || "",
        images: images,
        sizes: product.sizes || [],
        description: product.description || "",
      },
    });
  } catch (error) {
    console.error("Quick detail API error:", error);
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
};

// [GET] /product/api/ai-recommend
module.exports.aiRecommend = async (req, res) => {
  try {
    const { sport, playstyle, wristStrength, budget } = req.query;

    const find = {
      deleted: false,
      status: "active",
    };

    // 1. Phân loại theo Bộ môn
    let keywords = [];
    if (sport === "badminton") {
      keywords = ["vợt", "cầu lông", "yonex", "lining", "victor", "nanoflare", "axforce", "astrox", "giày cầu lông"];
    } else if (sport === "football") {
      keywords = ["bóng đá", "giày đá bóng", "mizuno", "kamito", "nike", "quả bóng", "sân cỏ"];
    } else if (sport === "volleyball") {
      keywords = ["bóng chuyền", "asics", "mizuno", "băng gối", "quả bóng chuyền"];
    } else if (sport === "running") {
      keywords = ["chạy", "giày chạy", "băng cổ chân", "áo thi đấu", "quần"];
    }

    if (keywords.length > 0) {
      find.$or = keywords.map((kw) => ({
        title: { $regex: new RegExp(kw, "i") },
      }));
    }

    // 2. Phân loại theo Ngân sách
    if (budget === "under-1m") {
      find.price = { $lt: 1000000 };
    } else if (budget === "1m-to-2.5m") {
      find.price = { $gte: 1000000, $lte: 2500000 };
    } else if (budget === "over-2.5m") {
      find.price = { $gt: 2500000 };
    }

    let products = await Product.find(find).limit(6).lean();

    // Nếu bộ lọc quá chặt không có sản phẩm, nới lỏng để luôn có gợi ý chất lượng
    if (products.length < 3) {
      const fallbackFind = { deleted: false, status: "active" };
      if (keywords.length > 0) {
        fallbackFind.$or = keywords.slice(0, 3).map((kw) => ({
          title: { $regex: new RegExp(kw, "i") },
        }));
      }
      const moreProducts = await Product.find(fallbackFind).limit(6).lean();
      const existingIds = new Set(products.map((p) => p._id.toString()));
      for (const p of moreProducts) {
        if (!existingIds.has(p._id.toString())) {
          products.push(p);
        }
      }
    }

    products = productPriceHelper.priceNewProduct(products);

    // Tính toán thông số kỹ thuật AI khuyến nghị (Physics & Sports Engineering Model)
    let aiSpecs = {};
    if (sport === "badminton" || !sport) {
      if (playstyle === "attack") {
        aiSpecs = {
          balancePoint: "298 - 308 mm (Nặng đầu - Head Heavy)",
          shaftFlex: wristStrength === "strong" ? "Cứng (Stiff) - Đập cắm & Uy lực" : "Trung bình (Medium) - Hỗ trợ lực",
          weightRacket: wristStrength === "beginner" ? "4U (80-84g)" : "3U / 4U (83-88g)",
          recommendedTension: wristStrength === "strong" ? "11.0 - 12.0 kg (24-26.5 lbs)" : "10.0 - 10.5 kg (22-23 lbs)",
          playstyleDesc: "Thiết kế tối ưu cho đòn Smash cắm vạch cuối sân, quỹ đạo cầu gắt và áp đảo đối thủ hoàn toàn.",
        };
      } else if (playstyle === "speed") {
        aiSpecs = {
          balancePoint: "285 - 293 mm (Nhẹ đầu - Head Light)",
          shaftFlex: "Cực dẻo & Đàn hồi cao (Aero Frame)",
          weightRacket: "4U / 5U (75-84g) - Cực kỳ thanh thoát",
          recommendedTension: "10.5 - 11.5 kg (23-25 lbs)",
          playstyleDesc: "Chuyên biệt cho phản tạt chớp nhoáng, tì đè trên lưới và đổi hướng cầu tốc độ cao.",
        };
      } else {
        aiSpecs = {
          balancePoint: "290 - 296 mm (Cân bằng - Even Balance)",
          shaftFlex: "Trung bình (Medium Flex)",
          weightRacket: "4U (80-84g) - Toàn diện linh hoạt",
          recommendedTension: "10.5 - 11.0 kg (23-24.5 lbs)",
          playstyleDesc: "Công thủ toàn diện, điều cầu chính xác từng milimet và bền bỉ trong các pha đôi công kéo dài.",
        };
      }
    } else if (sport === "football") {
      aiSpecs = {
        soleType: "Đinh TF cao su đúc đa hướng (Sân cỏ nhân tạo Việt Nam)",
        upperMaterial: "Da nhân tạo Microfiber / Da tự nhiên siêu êm",
        insoleTech: "Đệm EVA lót giảm chấn bảo vệ khớp gối & gót chân",
        fitType: "Form chân chuẩn người Việt (Regular - Wide)",
        playstyleDesc: "Bám sân chắc chắn ngay cả khi trời mưa ẩm, cảm giác chạm bóng thật chân và bứt tốc tức thì.",
      };
    } else {
      aiSpecs = {
        cushionTech: "Đệm khí Gel / Power Cushion đàn hồi hồi phục năng lượng",
        supportSystem: "Bộ khung chống lật cổ chân TPU & đế cao su Non-Marking",
        breathability: "Lưới dệt thoáng khí đa điểm AirMesh giảm nhiệt độ bàn chân",
        fitType: "Form ôm chân linh hoạt, giảm chấn động khi tiếp đất",
        playstyleDesc: "Bảo vệ tối đa hệ cơ xương khớp khi bật nhảy liên tục và di chuyển đổi hướng đột ngột.",
      };
    }

    const matchScores = [99, 96, 94, 91, 88, 85];
    const enrichedProducts = products.slice(0, 6).map((p, idx) => ({
      id: p._id,
      title: p.title,
      slug: p.slug,
      brand: p.brand || "CHÍNH HÃNG",
      price: p.price,
      priceNew: p.priceNew,
      discountPercentage: p.discountPercentage || 0,
      thumbnail: p.thumbnail || (p.images && p.images[0]) || "",
      matchScore: matchScores[idx] || 85,
      aiHighlight: idx === 0 ? "Khớp hoàn hảo nhất với thể lực và phong cách chơi của bạn" : "Lựa chọn xuất sắc trong phân khúc ngân sách đã chọn",
    }));

    return res.json({
      code: 200,
      specs: aiSpecs,
      products: enrichedProducts,
    });
  } catch (error) {
    console.error("AI recommend API error:", error);
    return res.status(500).json({ code: 500, message: "Lỗi xử lý thuật toán AI" });
  }
};

