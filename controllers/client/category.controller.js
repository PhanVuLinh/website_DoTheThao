const Category = require("../../models/category.model");
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
    res.render("client/pages/product-list.pug", {
      title: "Danh sách sản phẩm",
      breadcrumb: breadcrumb,
    });
  } else {
    res.redirect(`/`);
  }
};
