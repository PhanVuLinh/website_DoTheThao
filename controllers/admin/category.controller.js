module.exports.list = (req, res) => {
  res.render("admin/pages/category-list.pug", {
    title: "Danh sách danh mục",
  });
}

module.exports.create = (req, res) => {
  res.render("admin/pages/category-create.pug", {
    title: "Tạo mới danh mục",
  });
}