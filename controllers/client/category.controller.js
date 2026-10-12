const Category = require("../../models/category.model");
const Product = require("../../models/product.model");

const productPriceHelper = require("../../helpers/getPriceNew.helper.js");
const paginationHelper = require("../../helpers/pagination.helper");
module.exports.list = async (req, res) => {
  const slug = req.params.slug;
  const category = await Category.findOne({
    slug: slug,
    deleted: false,
    status: "active",
  });

  if (category) {
    //Breadcrumb
    const breadcrumb = {
      title: category.title,
      list: [
        {
          link: "/",
          title: "Trang Chủ",
        },
        // {
        //   link: "/products",
        //   title: "Sản Phẩm Thể Thao1",
        // },
      ],
    };
    //danh mục cha
    if (category.parent_id) {
      const parentCategory = await Category.findOne({
        _id: category.parent_id,
        deleted: false,
        status: "active",
      });
      if (parentCategory) {
        breadcrumb.list.push({
          link: `/category/${parentCategory.slug}`,
          title: parentCategory.title,
        });
      }
    }
    //danh mục hiện tại
    breadcrumb.list.push({
      link: `/category/${category.slug}`,
      title: category.title,
    });
    //End Breadcrumb

    // Lấy tất cả danh mục con cháu của danh mục hiện tại để hiển thị đầy đủ sản phẩm
    const getSubCategoryIds = async (parentId) => {
      const subs = await Category.find({
        parent_id: parentId,
        deleted: false,
        status: "active",
      }).select("_id");
      let subIds = subs.map((item) => item._id.toString());
      for (const sub of subs) {
        const grandSubs = await getSubCategoryIds(sub._id);
        subIds = subIds.concat(grandSubs);
      }
      return subIds;
    };

    const subCategoryIds = await getSubCategoryIds(category.id);
    const allCategoryIds = [category.id, ...subCategoryIds];

    // Danh mục cho bộ lọc bên trái (thông minh: hiển thị danh mục con hoặc danh mục cùng cấp)
    let filterCategories = [];
    if (category.parent_id) {
      filterCategories = await Category.find({
        deleted: false,
        status: "active",
        parent_id: category.parent_id,
      }).sort({ position: "desc" });
    } else {
      filterCategories = await Category.find({
        deleted: false,
        status: "active",
        parent_id: category.id,
      }).sort({ position: "desc" });
    }

    // XỬ LÝ LỌC & SẮP XẾP SẢN PHẨM
    const find = {
      category_id: { $in: allCategoryIds },
      deleted: false,
      status: "active",
    };

    const regexHelper = require("../../helpers/regex.helper");

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

    // 2. Lọc theo Thương Hiệu
    if (req.query.brand) {
      const brands = Array.isArray(req.query.brand)
        ? req.query.brand
        : [req.query.brand];
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

    // Lấy danh sách thương hiệu thực tế của danh mục này để hiển thị trên bộ lọc
    const rawBrands = await Product.distinct("brand", {
      category_id: { $in: allCategoryIds },
      deleted: false,
      status: "active",
    });
    const availableBrands = rawBrands.filter((b) => b && typeof b === "string" && b.trim() !== "");

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

    // Danh sách sản phẩm
    const productCategory = await Product.find(find).lean();
    const newProductCategory =
      productPriceHelper.priceNewProduct(productCategory);

    // Xử lý Sắp xếp (Sort)
    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        newProductCategory.sort((a, b) => a.priceNew - b.priceNew);
      } else if (req.query.sort === "price-desc") {
        newProductCategory.sort((a, b) => b.priceNew - a.priceNew);
      } else if (req.query.sort === "newest") {
        newProductCategory.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      }
    } else {
      newProductCategory.sort((a, b) => (b.position || 0) - (a.position || 0));
    }

    // Phân trang
    const countProduct = newProductCategory.length;
    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 12,
      },
      req.query,
      countProduct,
    );

    const paginatedProducts = newProductCategory.slice(
      objectPagination.skip,
      objectPagination.skip + objectPagination.limitItems,
    );

    res.render("client/pages/product-list.pug", {
      title: category.title || "Danh sách sản phẩm",
      breadcrumb: breadcrumb,
      productCategory: paginatedProducts,
      pagination: objectPagination,
      category: category,
      allChildCategories: filterCategories,
      availableBrands: availableBrands,
      canonicalSizes: canonicalSizes,
      activeFilters: activeFilters,
      totalCount: countProduct,
      queryPrice: req.query.price,
      queryPriceMin: req.query.priceMin,
      queryPriceMax: req.query.priceMax,
      queryBrand: req.query.brand,
      querySize: req.query.size,
      queryInStock: req.query.inStock,
      querySort: req.query.sort,
    });

  } else {
    res.redirect(`/`);
  }
};
