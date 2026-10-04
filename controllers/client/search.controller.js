const slugify = require("slugify");
const Product = require("../../models/product.model");
const regexHelper = require("../../helpers/regex.helper");
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

  // Get available brands for filtering
  const rawBrands = await Product.distinct("brand", {
    deleted: false,
    status: "active",
  });
  const availableBrands = rawBrands.filter((b) => b && typeof b === "string" && b.trim() !== "");

  res.render("client/pages/search.pug", {
    title: "Kết quả tìm kiếm",
    productList: productList,
    keyword: req.query.keyword,
    queryPrice: req.query.price,
    queryBrand: req.query.brand,
    querySort: req.query.sort,
    availableBrands: availableBrands,
  });
};
