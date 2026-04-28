const slugify = require("slugify");
const Product = require("../../models/product.model");
module.exports.searchList = async (req, res) => {
  const find = {
    deleted: false,
    status: "active",
  };

  if (req.query.keyword) {
    const keyword = req.query.keyword;
    const regex = new RegExp(keyword, "i");

    const slugKeyword = slugify(keyword, {
      lower: true,
      locale: "vi",
      strict: true,
    });
    const slugRegex = new RegExp(slugKeyword, "i");
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
    find.brand = { $in: brands.map((b) => new RegExp(b, "i")) };
  }
  const productList = await Product.find(find).sort({ position: "desc" });

  res.render("client/pages/search.pug", {
    title: "Kết quả tìm kiếm",
    productList: productList,
    keyword: req.query.keyword,
    queryPrice: req.query.price,
    queryBrand: req.query.brand,
  });
};
