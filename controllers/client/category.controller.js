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

    //danh mục cho bộ lọc danh mục
    const allChildCategories = await Category.find({
      deleted: false,
      status: "active",
      parent_id: { $ne: "" },
    }).sort({ position: "desc" });
    //End danh mục cho bộ lọc danh mục

    // XỬ LÝ LỌC & SẮP XẾP SẢN PHẨM
    const find = {
      category_id: category.id,
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
      const brands = Array.isArray(req.query.brand)
        ? req.query.brand
        : [req.query.brand];
      find.brand = { $in: brands.map((b) => new RegExp(b, "i")) };
    }

    //danh sách sản phẩm
    const productCategory = await Product.find(find).lean();
    const newProductCategory =
      productPriceHelper.priceNewProduct(productCategory);
    //end danh sách sản phẩm

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
      // Mặc định sắp xếp theo vị trí
      newProductCategory.sort((a, b) => b.position - a.position);
    }

    //Phân trang
    const countProduct = newProductCategory.length;
    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 9,
      },
      req.query,
      countProduct,
    );

    const paginatedProducts = newProductCategory.slice(
      objectPagination.skip,
      objectPagination.skip + objectPagination.limitItems,
    );
    //hết Phân trang
    res.render("client/pages/product-list.pug", {
      title: "Danh sách sản phẩm",
      breadcrumb: breadcrumb,
      productCategory: paginatedProducts,
      pagination: objectPagination,
      category: category,
      allChildCategories: allChildCategories,
      queryPrice: req.query.price,
      queryBrand: req.query.brand,
      querySort: req.query.sort,
      
    });
  } else {
    res.redirect(`/`);
  }
};
