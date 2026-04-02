module.exports.list = (req, res) => {
  res.render("admin/pages/user-list.pug", {
    title: "Danh sách người dùng",
  });
}