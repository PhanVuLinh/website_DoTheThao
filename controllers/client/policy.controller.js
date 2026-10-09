const Policy = require("../../models/policy.model");

// [GET] /policy/:slug
module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const policy = await Policy.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    });

    if (!policy) {
      req.flash("error", "Chính sách không tồn tại hoặc đã tạm dừng!");
      return res.redirect("/");
    }

    // Lấy toàn bộ danh sách chính sách đang áp dụng để làm menu điều hướng bên cạnh (Sidebar)
    const policyList = await Policy.find({
      deleted: false,
      status: "active",
    }).sort({ position: 1, createdAt: 1 });

    res.render("client/pages/policy-detail.pug", {
      title: policy.title,
      policy: policy,
      policyList: policyList,
      breadcrumb: {
        title: policy.title,
        list: [
          { title: "Trang chủ", link: "/" },
          { title: "Chính sách", link: "#" },
          { title: policy.title, link: `/policy/${policy.slug}` },
        ],
      },
    });
  } catch (error) {
    console.error("Client policy detail error:", error);
    res.redirect("/");
  }
};
