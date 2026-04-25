module.exports.list = (req, res) => {
  try {
    const breadcrumb = {
      title: "Tin Tức",
      list: [
        {
          link: "/",
          title: "Trang Chủ",
        },
        {
          link: "/article", 
          title: "Tin Tức",
        }
      ],
    };
    res.render("client/pages/article-list.pug", {
      title: "Danh sách bài viết",
      breadcrumb: breadcrumb,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/`);
  }
};
