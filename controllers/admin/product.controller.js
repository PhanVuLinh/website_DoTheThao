module.exports.list = (req, res) => {
  res.render("admin/pages/product-list.pug", {
    title: "Danh sách sản phẩm",
  });
}

module.exports.create = (req, res) => {
  res.render("admin/pages/product-create.pug", {
    title: "Tạo sản phẩm mới",
  });
}


module.exports.trash = (req, res) => {
  res.render("admin/pages/product-trash.pug", {
    title: "Thùng rác sản phẩm",
  });
}