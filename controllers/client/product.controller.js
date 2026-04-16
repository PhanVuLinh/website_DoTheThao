const Product = require("../../models/product.model");
const Category = require("../../models/category.model");

module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const productDetail = await Product.findOne({
      status: "active",
      deleted: false,
      slug: slug,
    });
    //Breadcrumb
    const breadcrumb = {
      title: productDetail.title,
      list: [
        {
          link: "/",
          title: "Trang Chủ",
        },
      ],
    };
    const category = await Category.findOne({
      _id: productDetail.category_id,
      deleted: false,
      status: "active",
    });
    if (category) {
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
    }

    breadcrumb.list.push({
      link: `/product/detail/${slug}`,
      title: productDetail.title,
    });
    //End Breadcrumb
    res.render("client/pages/product-detail.pug", {
      title: "Chi tiết sản phẩm",
      product: productDetail,
      breadcrumb: breadcrumb,
    });
  } catch (error) {
    req.flash("error", "Sản phẩm không tồn tại");
    res.redirect("/");
  }
};
