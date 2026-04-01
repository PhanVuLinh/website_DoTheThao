module.exports.list = (req, res) => {
  res.render("admin/pages/order-list.pug", {
    title: "Danh sách đơn hàng",
  });
}

module.exports.edit = (req, res) => {
  res.render("admin/pages/order-edit.pug", {
    title: "Chỉnh sửa đơn hàng",
  });
}