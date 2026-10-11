const mongoose = require("mongoose");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Review = require("../../models/review.model");
const productPriceHelper = require("../../helpers/getPriceNew.helper");

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ocirc;/g, "ô")
    .replace(/&Ocirc;/g, "Ô")
    .replace(/&oacute;/g, "ó")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&ograve;/g, "ò")
    .replace(/&Ograve;/g, "Ò")
    .replace(/&otilde;/g, "õ")
    .replace(/&Otilde;/g, "Õ")
    .replace(/&aacute;/g, "á")
    .replace(/&Aacute;/g, "Á")
    .replace(/&agrave;/g, "à")
    .replace(/&Agrave;/g, "À")
    .replace(/&atilde;/g, "ã")
    .replace(/&Atilde;/g, "Ã")
    .replace(/&eacute;/g, "é")
    .replace(/&Eacute;/g, "É")
    .replace(/&egrave;/g, "è")
    .replace(/&Egrave;/g, "È")
    .replace(/&ecirc;/g, "ê")
    .replace(/&Ecirc;/g, "Ê")
    .replace(/&iacute;/g, "í")
    .replace(/&Iacute;/g, "Í")
    .replace(/&igrave;/g, "ì")
    .replace(/&Igrave;/g, "Ì")
    .replace(/&uacute;/g, "ú")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&ugrave;/g, "ù")
    .replace(/&Ugrave;/g, "Ù")
    .replace(/&yacute;/g, "ý")
    .replace(/&Yacute;/g, "Ý")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

/**
 * [GET] /compare
 * Render trang so sánh chi tiết giữa 2 - 4 sản phẩm
 */
module.exports.index = async (req, res) => {
  try {
    let idsParam = req.query.ids;
    let idList = [];

    if (idsParam) {
      if (Array.isArray(idsParam)) {
        idList = idsParam;
      } else if (typeof idsParam === "string") {
        idList = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
      }
    }

    // Lọc các ObjectId hợp lệ và tối đa 4 sản phẩm
    const validIds = idList
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .slice(0, 4);

    let enrichedProducts = [];

    if (validIds.length > 0) {
      const rawProducts = await Product.find({
        _id: { $in: validIds },
        deleted: false,
        status: "active",
      }).lean();

      // Giữ đúng thứ tự mà user đã chọn
      const productMap = new Map();
      rawProducts.forEach((p) => productMap.set(p._id.toString(), p));
      const orderedProducts = validIds
        .map((id) => productMap.get(id))
        .filter(Boolean);

      // Tính giá mới (áp dụng giảm giá)
      const pricedProducts = productPriceHelper.priceNewProduct(orderedProducts);

      // Tìm giá thấp nhất trong danh sách so sánh
      const minPrice = pricedProducts.reduce(
        (min, p) => (p.priceNew < min ? p.priceNew : min),
        Infinity
      );

      // Làm giàu thông tin cho từng sản phẩm: danh mục, reviews, sizes, tổng tồn kho
      enrichedProducts = await Promise.all(
        pricedProducts.map(async (prod) => {
          // 1. Tên danh mục
          let categoryTitle = "Thể Thao";
          if (prod.category_id) {
            const cat = await Category.findOne({
              _id: prod.category_id,
              deleted: false,
            }).select("title").lean();
            if (cat && cat.title) {
              categoryTitle = cat.title;
            }
          }

          // 2. Reviews & Rating
          const reviews = await Review.find({
            product_id: prod._id,
            deleted: false,
            status: "active",
          }).select("rating").lean();

          const totalReviews = reviews.length;
          let avgRating = "5.0";
          if (totalReviews > 0) {
            const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            avgRating = (sumRating / totalReviews).toFixed(1);
          }

          // 3. Chuẩn hóa Sizes & Tồn kho
          let formattedSizes = [];
          let totalStock = 0;
          if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
            formattedSizes = prod.sizes.map((s) => {
              const stockNum = Number(s.stock) || 0;
              totalStock += stockNum;
              return {
                size: String(s.size || "").trim(),
                stock: stockNum,
                inStock: stockNum > 0,
              };
            });
          }

          // 4. Clean description tóm tắt ngắn
          let plainDesc = "";
          if (prod.description) {
            plainDesc = decodeHtmlEntities(
              String(prod.description).replace(/<[^>]*>?/gm, " ")
            )
              .replace(/\s+/g, " ")
              .trim();
            if (plainDesc.length > 220) {
              plainDesc = plainDesc.substring(0, 217) + "...";
            }
          }

          return {
            ...prod,
            categoryTitle: categoryTitle,
            avgRating: avgRating,
            totalReviews: totalReviews,
            formattedSizes: formattedSizes,
            totalStock: totalStock,
            summaryDesc: plainDesc || "Sản phẩm thể thao cao cấp chính hãng mang đến trải nghiệm êm ái, bứt tốc vượt trội.",
            isLowestPrice: prod.priceNew === minPrice && pricedProducts.length > 1,
          };
        })
      );
    }

    const breadcrumb = {
      title: "So Sánh Sản Phẩm",
      list: [
        { link: "/", title: "Trang Chủ" },
        { link: "/compare", title: "So Sánh Sản Phẩm" },
      ],
    };

    res.render("client/pages/compare.pug", {
      title: "So Sánh Chi Tiết Sản Phẩm - SportStore",
      breadcrumb: breadcrumb,
      products: enrichedProducts,
      comparedIds: validIds.join(","),
    });
  } catch (error) {
    console.error("Lỗi trang compare:", error);
    req.flash("error", "Có lỗi xảy ra khi tải trang so sánh");
    res.redirect("/");
  }
};

/**
 * [GET] /compare/api/products?ids=id1,id2
 * API JSON lấy nhanh thông tin chi tiết các sản phẩm để so sánh (AJAX)
 */
module.exports.getProductsData = async (req, res) => {
  try {
    let idsParam = req.query.ids;
    let idList = [];

    if (idsParam) {
      if (Array.isArray(idsParam)) {
        idList = idsParam;
      } else if (typeof idsParam === "string") {
        idList = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
      }
    }

    const validIds = idList
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .slice(0, 4);

    if (validIds.length === 0) {
      return res.json({ code: 200, success: true, products: [] });
    }

    const rawProducts = await Product.find({
      _id: { $in: validIds },
      deleted: false,
      status: "active",
    }).lean();

    const pricedProducts = productPriceHelper.priceNewProduct(rawProducts);

    const minPrice = pricedProducts.reduce(
      (min, p) => (p.priceNew < min ? p.priceNew : min),
      Infinity
    );

    const enriched = await Promise.all(
      pricedProducts.map(async (prod) => {
        let categoryTitle = "Thể Thao";
        if (prod.category_id) {
          const cat = await Category.findOne({
            _id: prod.category_id,
            deleted: false,
          }).select("title").lean();
          if (cat) categoryTitle = cat.title;
        }

        const reviews = await Review.find({
          product_id: prod._id,
          deleted: false,
          status: "active",
        }).select("rating").lean();

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
          : "5.0";

        let totalStock = 0;
        const formattedSizes = (prod.sizes || []).map((s) => {
          const stock = Number(s.stock) || 0;
          totalStock += stock;
          return {
            size: String(s.size || "").trim(),
            stock: stock,
            inStock: stock > 0,
          };
        });

        return {
          id: prod._id.toString(),
          title: prod.title,
          slug: prod.slug,
          thumbnail: prod.thumbnail,
          brand: prod.brand || "CHÍNH HÃNG",
          categoryTitle: categoryTitle,
          price: prod.price,
          priceNew: prod.priceNew,
          discountPercentage: prod.discountPercentage || 0,
          isLowestPrice: prod.priceNew === minPrice && pricedProducts.length > 1,
          avgRating: avgRating,
          totalReviews: totalReviews,
          sizes: formattedSizes,
          totalStock: totalStock,
          featured: prod.featured === "1",
        };
      })
    );

    return res.json({
      code: 200,
      success: true,
      products: enriched,
    });
  } catch (error) {
    console.error("API compare error:", error);
    return res.status(500).json({ code: 500, success: false, message: "Lỗi hệ thống" });
  }
};
