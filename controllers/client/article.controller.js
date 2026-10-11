const moment = require("moment");
const Article = require("../../models/article.model");
const paginationHelper = require("../../helpers/pagination.helper");

module.exports.list = async (req, res) => {
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
        },
      ],
    };

    const countArticles = await Article.countDocuments({ status: "active", deleted: false });
    const objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 6,
      },
      req.query,
      countArticles,
    );

    const articles = await Article.find({ status: "active", deleted: false })
      .sort({ createdAt: "desc" })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    for (const item of articles) {
      item.createdAtFormat = moment(item.createdAt).format(
        "HH:mm - DD/MM/YYYY",
      );
    }
    res.render("client/pages/article-list.pug", {
      title: "Danh sách bài viết",
      breadcrumb: breadcrumb,
      articles: articles,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Không tồn tại");
    res.redirect(`/`);
  }
};

module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;

    const article = await Article.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    });

    if (!article) {
      req.flash("error", "Bài viết không tồn tại!");
      return res.redirect("/article");
    }

    article.createdAtFormat = moment(article.createdAt).format(
      "HH:mm - DD/MM/YYYY",
    );

    const breadcrumb = {
      title: article.title,
      list: [
        { link: "/", title: "Trang Chủ" },
        { link: "/article", title: "Tin Tức" },
        { link: `/article/detail/${article.slug}`, title: article.title },
      ],
    };

    const newArticles = await Article.find({
      _id: { $ne: article.id },
      deleted: false,
      status: "active",
    })
      .sort({ createdAt: "desc" })
      .limit(5);

    for (const item of newArticles) {
      item.createdAtFormat = moment(item.createdAt).format("DD/MM/YYYY");
    }

    res.render("client/pages/article-detail.pug", {
      title: article.title,
      breadcrumb: breadcrumb,
      article: article,
      newArticles: newArticles,
    });
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect(`/article`);
  }
};
