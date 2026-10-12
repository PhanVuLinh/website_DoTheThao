const slugify = require("slugify");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const regexHelper = require("../../helpers/regex.helper");
const paginationHelper = require("../../helpers/pagination.helper");
const productPriceHelper = require("../../helpers/getPriceNew.helper.js");

module.exports.searchList = async (req, res) => {
  const find = {
    deleted: false,
    status: "active",
  };

  if (req.query.keyword) {
    const rawKeyword = (req.query.keyword || "").trim();
    const safeKeyword = regexHelper.escapeRegex(rawKeyword);
    const regex = new RegExp(safeKeyword, "i");

    const slugKeyword = slugify(rawKeyword, {
      lower: true,
      locale: "vi",
      strict: true,
    });
    const slugRegex = new RegExp(regexHelper.escapeRegex(slugKeyword), "i");
    find.$or = [{ title: regex }, { slug: slugRegex }];
  }

  if (req.query.price) {
    if (req.query.price === "under-1m") {
      find.price = { $lt: 1000000 };
    } else if (req.query.price === "1m-to-3m") {
      find.price = { $gte: 1000000, $lte: 3000000 };
    } else if (req.query.price === "over-3m") {
      find.price = { $gt: 3000000 };
    }
  }

  if (req.query.brand) {
    const brands = Array.isArray(req.query.brand)
      ? req.query.brand
      : [req.query.brand];
    find.brand = {
      $in: brands.map((b) => new RegExp(regexHelper.escapeRegex(String(b).trim()), "i")),
    };
  }

  const rawProducts = await Product.find(find).lean().sort({ position: "desc" });
  let productList = productPriceHelper.priceNewProduct(rawProducts);

  if (req.query.sort) {
    if (req.query.sort === "price-asc") {
      productList.sort((a, b) => a.priceNew - b.priceNew);
    } else if (req.query.sort === "price-desc") {
      productList.sort((a, b) => b.priceNew - a.priceNew);
    } else if (req.query.sort === "newest") {
      productList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
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

  // Get available brands for filtering
  const rawBrands = await Product.distinct("brand", {
    deleted: false,
    status: "active",
  });
  const availableBrands = rawBrands.filter((b) => b && typeof b === "string" && b.trim() !== "");

  res.render("client/pages/search.pug", {
    title: "Kết quả tìm kiếm",
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

    const safeKeyword = regexHelper.escapeRegex(rawKeyword);
    const regex = new RegExp(safeKeyword, "i");

    const slugKeyword = slugify(rawKeyword, {
      lower: true,
      locale: "vi",
      strict: true,
    });
    const slugRegex = new RegExp(regexHelper.escapeRegex(slugKeyword), "i");

    const findProduct = {
      deleted: false,
      status: "active",
      $or: [{ title: regex }, { slug: slugRegex }],
    };

    // Đếm tổng số kết quả sản phẩm khớp
    const totalMatches = await Product.countDocuments(findProduct);

    // Lấy top 5 sản phẩm nổi bật nhất
    const rawProducts = await Product.find(findProduct)
      .select("title slug thumbnail images price discountPercentage brand")
      .sort({ position: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const products = productPriceHelper.priceNewProduct(rawProducts).map((item) => ({
      _id: item._id,
      title: item.title,
      slug: item.slug,
      thumbnail: item.thumbnail,
      price: item.price || 0,
      priceNew: item.priceNew || item.price || 0,
      discountPercentage: item.discountPercentage || 0,
      brand: item.brand || "",
    }));

    // Tìm danh mục khớp (Top 3)
    const categories = await Category.find({
      deleted: false,
      status: "active",
      $or: [{ title: regex }, { slug: slugRegex }],
    })
      .select("title slug")
      .limit(3)
      .lean();

    // Tìm thương hiệu khớp (Top 3)
    const rawBrands = await Product.distinct("brand", {
      deleted: false,
      status: "active",
      brand: regex,
    });
    const brands = rawBrands
      .filter((b) => b && typeof b === "string" && b.trim() !== "")
      .slice(0, 3);

    return res.json({
      code: 200,
      keyword: rawKeyword,
      totalMatches,
      products,
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

