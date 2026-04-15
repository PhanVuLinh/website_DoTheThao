const Category = require("../../models/category.model");
const Product = require("../../models/product.model");

const productPriceHelper = require("../../helpers/getPriceNew.helper.js");
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

    //danh sách sản phẩm
    const productCategory = await Product.find({
      category_id: category.id,
      deleted: false,
      status: "active",
    })
      .sort({
        position: "desc",
      })
      .lean();
    const newProductCategory =
      productPriceHelper.priceNewProduct(productCategory);
    //end danh sách sản phẩm

    res.render("client/pages/product-list.pug", {
      title: "Danh sách sản phẩm",
      breadcrumb: breadcrumb,
      productCategory: newProductCategory,
    });
  } else {
    res.redirect(`/`);
  }
};
