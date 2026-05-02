module.exports.profile = (req, res) => {
  res.render("client/pages/user-profile.pug", {
    title: "Thông tin cá nhân",
  });
}

module.exports.orders = (req, res) => {
  res.render("client/pages/user-orders.pug", {
    title: "Đơn hàng của tôi",
  });
}