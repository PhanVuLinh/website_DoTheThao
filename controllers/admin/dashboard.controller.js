module.exports.dashboard = (req, res) => {
  res.render("admin/pages/dashboard.pug", {
    title: "Tổng quan",
  });
}