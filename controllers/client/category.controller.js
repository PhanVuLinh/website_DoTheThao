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

    // Lọc theo Khoảng Giá
    if (req.query.price) {
      if (req.query.price === "under-1m") {
        find.price = { $lt: 1000000 };
      } else if (req.query.price === "1m-to-3m") {
        find.price = { $gte: 1000000, $lte: 3000000 };
      } else if (req.query.price === "over-3m") {
        find.price = { $gt: 3000000 };
      }
    }

    // Lọc theo Thương Hiệu
    if (req.query.brand) {
      const regexHelper = require("../../helpers/regex.helper");
      const brands = Array.isArray(req.query.brand)
        ? req.query.brand
        : [req.query.brand];
      find.brand = {
        $in: brands.map((b) => new RegExp(regexHelper.escapeRegex(String(b).trim()), "i")),
      };
    }

    // Lấy danh sách thương hiệu thực tế của danh mục này để hiển thị trên bộ lọc
    const rawBrands = await Product.distinct("brand", {
      category_id: { $in: allCategoryIds },
      deleted: false,
      status: "active",
    });
    const availableBrands = rawBrands.filter((b) => b && typeof b === "string" && b.trim() !== "");

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
      totalCount: countProduct,
      queryPrice: req.query.price,
      queryBrand: req.query.brand,
      querySort: req.query.sort,
    });

  } else {
    res.redirect(`/`);
  }
};
