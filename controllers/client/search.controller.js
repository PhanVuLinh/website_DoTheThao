const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const regexHelper = require("../../helpers/regex.helper");
const searchHelper = require("../../helpers/search.helper");
const paginationHelper = require("../../helpers/pagination.helper");
const productPriceHelper = require("../../helpers/getPriceNew.helper.js");

// [GET] /search
module.exports.searchList = async (req, res) => {
  const find = {
    deleted: false,
    status: "active",
  };

  let cleanKeyword = "";
  let searchTokens = [];

  // Tìm kiếm thông minh đa từ khóa & không phân biệt dấu
  if (req.query.keyword) {
    const smartSearch = await searchHelper.buildSmartSearchFilter(req.query.keyword);
    cleanKeyword = smartSearch.cleanKeyword;
    searchTokens = smartSearch.tokens;

    if (smartSearch.filter && smartSearch.filter.$or) {
      find.$or = smartSearch.filter.$or;
    }
  }

  // Lọc theo khoảng giá
  if (req.query.price) {
    if (req.query.price === "under-1m") {
      find.price = { $lt: 1000000 };
    } else if (req.query.price === "1m-to-3m") {
      find.price = { $gte: 1000000, $lte: 3000000 };
    } else if (req.query.price === "over-3m") {
      find.price = { $gt: 3000000 };
    }
  }

  // Lọc theo thương hiệu
  if (req.query.brand) {
    const brands = Array.isArray(req.query.brand)
      ? req.query.brand
      : [req.query.brand];
    find.brand = {
      $in: brands.map((b) => new RegExp(regexHelper.escapeRegex(String(b).trim()), "i")),
    };
  }

  // Giới hạn an toàn tối đa 200 sản phẩm ứng viên để chấm điểm độ liên quan, chống cạn kiệt RAM
  const rawProducts = await Product.find(find).limit(200).lean();
  let productList = productPriceHelper.priceNewProduct(rawProducts);

  // Sắp xếp theo yêu cầu hoặc sắp xếp theo mức độ liên quan (Relevance Scoring)
  if (req.query.sort) {
    if (req.query.sort === "price-asc") {
      productList.sort((a, b) => a.priceNew - b.priceNew);
    } else if (req.query.sort === "price-desc") {
      productList.sort((a, b) => b.priceNew - a.priceNew);
    } else if (req.query.sort === "newest") {
      productList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  } else if (cleanKeyword) {
    // Sắp xếp thông minh: Sản phẩm liên quan nhất lên đầu
    productList.forEach((prod) => {
      prod.relevanceScore = searchHelper.calculateRelevanceScore(
        prod,
        cleanKeyword,
        searchTokens,
      );
    });
    productList.sort((a, b) => b.relevanceScore - a.relevanceScore);
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

  // Lấy các thương hiệu sẵn có để lọc
  const rawBrands = await Product.distinct("brand", {
    deleted: false,
    status: "active",
  });
  const availableBrands = rawBrands.filter((b) => b && typeof b === "string" && b.trim() !== "");

  res.render("client/pages/search.pug", {
    title: cleanKeyword ? `Tìm kiếm: "${cleanKeyword}"` : "Kết quả tìm kiếm",
    productList: paginatedProducts,
    totalCount: countProduct,
    pagination: objectPagination,
    keyword: req.query.keyword,
    queryPrice: req.query.price,
    queryBrand: req.query.brand,
    querySort: req.query.sort,
    availableBrands: availableBrands,
  });
};

// [GET] /search/suggest
module.exports.suggest = async (req, res) => {
  try {
    const rawKeyword = (req.query.keyword || "").trim();
    if (!rawKeyword || rawKeyword.length < 2) {
      return res.json({
        code: 200,
        keyword: rawKeyword,
        totalMatches: 0,
        products: [],
        categories: [],
        brands: [],
      });
    }

    const smartSearch = await searchHelper.buildSmartSearchFilter(rawKeyword);
    const cleanKeyword = smartSearch.cleanKeyword;
    const searchTokens = smartSearch.tokens;

    const findProduct = {
      deleted: false,
      status: "active",
    };

    if (smartSearch.filter && smartSearch.filter.$or) {
      findProduct.$or = smartSearch.filter.$or;
    }

    // Đếm tổng số kết quả sản phẩm khớp
    const totalMatches = await Product.countDocuments(findProduct);

    // Lấy danh sách sản phẩm ứng viên
    const rawProducts = await Product.find(findProduct)
      .select("title slug thumbnail images price discountPercentage brand category_id position featured")
      .lean();

    let products = productPriceHelper.priceNewProduct(rawProducts);

    // Chấm điểm độ liên quan và sắp xếp kết quả chuẩn nhất lên đầu
    products.forEach((prod) => {
      prod.relevanceScore = searchHelper.calculateRelevanceScore(
        prod,
        cleanKeyword,
        searchTokens,
      );
    });
    products.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Chỉ lấy Top 5 sản phẩm liên quan nhất cho Dropdown gợi ý
    const topProducts = products.slice(0, 5).map((item) => ({
      _id: item._id,
      title: item.title,
      slug: item.slug,
      thumbnail: item.thumbnail,
      price: item.price || 0,
      priceNew: item.priceNew || item.price || 0,
      discountPercentage: item.discountPercentage || 0,
      brand: item.brand || "",
    }));

    // Tìm danh mục liên quan (Top 3)
    const categoryOrConditions = [
      { title: smartSearch.phraseRegex },
      { slug: smartSearch.slugRegex },
    ];
    if (searchTokens.length > 1) {
      searchTokens.forEach((t) => {
        categoryOrConditions.push({ title: t.regex });
      });
    }

    const categories = await Category.find({
      deleted: false,
      status: "active",
      $or: categoryOrConditions,
    })
      .select("title slug")
      .limit(3)
      .lean();

    // Tìm thương hiệu liên quan (Top 3)
    const distinctBrands = await Product.distinct("brand", {
      deleted: false,
      status: "active",
    });

    const cleanLower = cleanKeyword.toLowerCase();
    const cleanNoAccent = searchHelper.removeVietnameseAccents(cleanKeyword);

    const brands = distinctBrands
      .filter((b) => {
        if (!b || typeof b !== "string") return false;
        const bLower = b.toLowerCase();
        const bNoAccent = searchHelper.removeVietnameseAccents(b);
        return (
          bLower.includes(cleanLower) ||
          cleanLower.includes(bLower) ||
          bNoAccent.includes(cleanNoAccent) ||
          searchTokens.some((t) => bLower.includes(t.raw.toLowerCase()))
        );
      })
      .slice(0, 3);

    return res.json({
      code: 200,
      keyword: rawKeyword,
      totalMatches,
      products: topProducts,
      categories,
      brands,
    });
  } catch (error) {
    console.error("Lỗi Live Search Suggest:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi tìm kiếm gợi ý",
      products: [],
      categories: [],
      brands: [],
      totalMatches: 0,
    });
  }
};
