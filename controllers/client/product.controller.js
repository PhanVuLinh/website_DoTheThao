const moment = require("moment");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Brand = require("../../models/brand.model");
const Review = require("../../models/review.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const SettingWebsiteInfo = require("../../models/setting-website-info.model");
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

    // Đếm tổng số sản phẩm thỏa mãn điều kiện lọc
    const countProduct = await Product.countDocuments(find);
    const objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 12,
      },
      req.query,
      countProduct,
    );

    let paginatedProducts = [];
    if (req.query.sort === "price-asc" || req.query.sort === "price-desc") {
      const sortDirection = req.query.sort === "price-asc" ? 1 : -1;
      paginatedProducts = await Product.aggregate([
        { $match: find },
        {
          $addFields: {
            calculatedPriceNew: {
              $multiply: [
                "$price",
                {
                  $subtract: [
                    1,
                    { $divide: [{ $ifNull: ["$discountPercentage", 0] }, 100] },
                  ],
                },
              ],
            },
          },
        },
        { $sort: { calculatedPriceNew: sortDirection, _id: -1 } },
        { $skip: objectPagination.skip },
        { $limit: objectPagination.limitItems },
      ]);
    } else {
      let sortMongo = { position: -1, createdAt: -1 };
      if (req.query.sort === "newest") {
        sortMongo = { createdAt: -1 };
      }
      paginatedProducts = await Product.find(find)
        .sort(sortMongo)
        .skip(objectPagination.skip)
        .limit(objectPagination.limitItems)
        .lean();
    }

    const productList = productPriceHelper.priceNewProduct(paginatedProducts);

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
    req.flash("error", "Có lỗi xảy ra khi tải danh sách sản phẩm. Vui lòng thử lại sau!");
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
      req.flash("error", "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh!");
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
    req.flash("error", "Không tìm thấy thông tin sản phẩm này!");
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

    // Lấy cấu hình website & trợ lý AI từ database
    const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});

    // Kiểm tra trợ lý AI có đang hoạt động không
    if (settingWebsiteInfo && settingWebsiteInfo.aiLabActive === false) {
      return res.json({
        code: 403,
        message: "Tính năng Trợ lý AI hiện đang tạm bảo trì.",
        specs: null,
        products: [],
      });
    }

    // Danh sách bộ môn thể thao từ cấu hình Admin (hoặc fallback nếu chưa cấu hình)
    const sportsList = (settingWebsiteInfo && settingWebsiteInfo.aiSports && settingWebsiteInfo.aiSports.length > 0)
      ? settingWebsiteInfo.aiSports
      : [
          {
            key: "badminton",
            title: "Cầu Lông",
            keywords: "vợt, cầu lông, yonex, lining, victor, nanoflare, axforce, astrox, giày cầu lông",
            attackSpecs: "Vợt nặng đầu (300-308mm), thân cứng (Stiff), 3U/4U, cước 11-12kg trợ lực smash",
            speedSpecs: "Vợt nhẹ đầu (285-293mm), thân dẻo thoát tay, 4U/5U, cước 10.5-11.5kg phản tạt",
            allroundSpecs: "Vợt cân bằng (290-296mm), thân trung bình, 4U, cước 10.5-11.0kg toàn diện",
          },
          {
            key: "football",
            title: "Bóng Đá",
            keywords: "bóng đá, đá banh, giày đá bóng, tf, kamito, mizuno, wika, quả bóng, sân cỏ",
            attackSpecs: "Form ôm mũi nhọn, đinh TF cao su đúc đa hướng bám sân, tăng lực sút mu & bứt tốc",
            speedSpecs: "Trọng lượng siêu nhẹ (<200g), upper microfiber cảm giác bóng thật chân",
            allroundSpecs: "Đệm EVA lót giảm chấn bảo vệ khớp gối & gót chân, upper êm ái kiểm soát bóng",
          },
          {
            key: "volleyball",
            title: "Bóng Chuyền",
            keywords: "bóng chuyền, giày bóng chuyền, asics, mizuno, đệm bật, bóng thi đấu",
            attackSpecs: "Đệm gót Power Cushion / Gel siêu êm trợ lực bật cao dứt điểm trên lưới",
            speedSpecs: "Đế ma sát đa hướng, cổ thấp linh hoạt cứu bóng và di chuyển nhanh",
            allroundSpecs: "Khung chống lật cổ chân TPU, bảo vệ an toàn khớp gối khi tiếp đất sàn cứng",
          },
          {
            key: "running",
            title: "Chạy Bộ & Gym",
            keywords: "chạy, running, giày chạy, marathon, gym, thể thao, quần áo thể thao",
            attackSpecs: "Đế carbon đàn hồi bứt phá tốc độ, hoàn trả lực tối đa cho pace cao",
            speedSpecs: "Trọng lượng lông vũ, upper lưới thoáng khí giảm nhiệt độ bàn chân",
            allroundSpecs: "Đệm bọt êm dày Max Cushion chống chấn thương khớp gối & gót chân cự ly dài",
          },
          {
            key: "pickleball",
            title: "Pickleball & Tennis",
            keywords: "pickleball, tennis, vợt pickleball, giày tennis, joola, head",
            attackSpecs: "Mặt Carbon T700 thô, lõi polymer 13-14mm smash uy lực & độ xoáy topspin cực cao",
            speedSpecs: "Trọng lượng nhẹ 7.5-7.8 oz, vung vợt chớp nhoáng tại vùng kitchen",
            allroundSpecs: "Lõi dày 16mm giảm chấn, sweet spot rộng kiểm soát dink êm ái toàn diện",
          },
        ];

    // Tìm cấu hình môn thể thao khách hàng đã chọn
    const currentSport = sportsList.find((s) => s.key === (sport || "").toLowerCase()) || sportsList[0];

    const find = {
      deleted: false,
      status: "active",
    };

    // 1. Phân loại theo Bộ môn: tách các từ khóa do Admin thiết lập
    let keywords = [];
    if (currentSport && currentSport.keywords) {
      keywords = currentSport.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
    }

    if (keywords.length > 0) {
      find.$or = keywords.map((kw) => ({
        title: { $regex: new RegExp(regexHelper.escapeRegex(kw), "i") },
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

    // Nếu bộ lọc ngân sách quá chặt không có sản phẩm, nới lỏng để luôn có gợi ý chất lượng trong kho
    if (products.length < 3) {
      const fallbackFind = { deleted: false, status: "active" };
      if (keywords.length > 0) {
        fallbackFind.$or = keywords.slice(0, 3).map((kw) => ({
          title: { $regex: new RegExp(regexHelper.escapeRegex(kw), "i") },
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

    // Trường hợp kho hàng môn này chưa có sản phẩm đúng tên, lấy sản phẩm nổi bật
    if (products.length === 0) {
      products = await Product.find({ deleted: false, status: "active" }).limit(6).lean();
    }

    products = productPriceHelper.priceNewProduct(products);

    // Xác định lời khuyên kỹ thuật theo lối chơi và cấu hình môn thể thao do Admin thiết lập
    let playstyleAdvice = currentSport.allroundSpecs || "Công thủ toàn diện, linh hoạt & bền bỉ.";
    if (playstyle === "attack" && currentSport.attackSpecs) {
      playstyleAdvice = currentSport.attackSpecs;
    } else if (playstyle === "speed" && currentSport.speedSpecs) {
      playstyleAdvice = currentSport.speedSpecs;
    }

    // Tính toán thông số kỹ thuật AI khuyến nghị (Physics & Dynamic Sports Specs)
    const aiSpecs = {
      sportTitle: currentSport.title,
      playstyleDesc: playstyleAdvice,
    };

    if (currentSport.key === "badminton" || !sport) {
      if (playstyle === "attack") {
        aiSpecs.balancePoint = "298 - 308 mm (Nặng đầu - Head Heavy)";
        aiSpecs.shaftFlex = wristStrength === "strong" ? "Cứng (Stiff) - Đập cắm & Uy lực" : "Trung bình (Medium) - Hỗ trợ lực";
        aiSpecs.weightRacket = wristStrength === "beginner" ? "4U (80-84g)" : "3U / 4U (83-88g)";
        aiSpecs.recommendedTension = wristStrength === "strong" ? "11.0 - 12.0 kg (24-26.5 lbs)" : "10.0 - 10.5 kg (22-23 lbs)";
      } else if (playstyle === "speed") {
        aiSpecs.balancePoint = "285 - 293 mm (Nhẹ đầu - Head Light)";
        aiSpecs.shaftFlex = "Cực dẻo & Đàn hồi cao (Aero Frame)";
        aiSpecs.weightRacket = "4U / 5U (75-84g) - Cực kỳ thanh thoát";
        aiSpecs.recommendedTension = "10.5 - 11.5 kg (23-25 lbs)";
      } else {
        aiSpecs.balancePoint = "290 - 296 mm (Cân bằng - Even Balance)";
        aiSpecs.shaftFlex = "Trung bình (Medium Flex)";
        aiSpecs.weightRacket = "4U (80-84g) - Toàn diện linh hoạt";
        aiSpecs.recommendedTension = "10.5 - 11.0 kg (23-24.5 lbs)";
      }
    } else if (currentSport.key === "football") {
      aiSpecs.soleType = "Đinh TF cao su đúc đa hướng (Sân cỏ nhân tạo Việt Nam)";
      aiSpecs.upperMaterial = "Da nhân tạo Microfiber / Da tự nhiên siêu êm";
      aiSpecs.insoleTech = "Đệm EVA lót giảm chấn bảo vệ khớp gối & gót chân";
      aiSpecs.fitType = "Form chân chuẩn người Việt (Regular - Wide)";
    } else {
      aiSpecs.cushionTech = "Đệm đàn hồi cao cấp hoàn trả năng lượng tối đa";
      aiSpecs.supportSystem = "Khung hỗ trợ chống lật cổ chân TPU & đế cao su chịu mài mòn";
      aiSpecs.breathability = "Chất liệu thoáng khí cao cấp giảm nhiệt độ vận động";
      aiSpecs.fitType = "Thiết kế ôm chân công thái học, bảo vệ hệ cơ xương khớp";
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

