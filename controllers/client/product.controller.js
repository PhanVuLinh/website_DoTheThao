const Product = require("../../models/product.model");
const Category = require("../../models/category.model");

const productPriceHelper = require("../../helpers/getPriceNew.helper.js");


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

    res.render("client/pages/product-detail.pug", {
      title: newProductDetail.title || "Chi tiết sản phẩm",
      product: newProductDetail,
      breadcrumb: breadcrumb,
      productDetail: newProductDetail,
    });
  } catch (error) {
    console.error("Product detail error:", error);
    req.flash("error", "Sản phẩm không tồn tại");
    return res.redirect("/");
  }
};

