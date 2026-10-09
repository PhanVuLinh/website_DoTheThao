const Policy = require("../../models/policy.model");
const variableConfig = require("../../config/variable");
const moment = require("moment");

// [GET] /admin/policy/list
module.exports.list = async (req, res) => {
  try {
    const policies = await Policy.find({ deleted: false }).sort({ position: 1, createdAt: 1 });

    policies.forEach((item) => {
      item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
    });

    res.render("admin/pages/policy-list.pug", {
      title: "Quản lý chính sách cửa hàng",
      policies: policies,
    });
  } catch (error) {
    console.error("Admin policy list error:", error);
    req.flash("error", "Lỗi tải danh sách chính sách!");
    res.redirect(`/${variableConfig.pathAdmin}/dashboard`);
  }
};

// [GET] /admin/policy/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const policy = await Policy.findOne({ _id: id, deleted: false });

    if (!policy) {
      req.flash("error", "Chính sách không tồn tại!");
      return res.redirect(`/${variableConfig.pathAdmin}/policy/list`);
    }

    res.render("admin/pages/policy-edit.pug", {
      title: `Chỉnh sửa: ${policy.title}`,
      policy: policy,
    });
  } catch (error) {
    console.error("Admin policy edit error:", error);
    req.flash("error", "Lỗi tải thông tin chính sách!");
    res.redirect(`/${variableConfig.pathAdmin}/policy/list`);
  }
};

// [PATCH] /admin/policy/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.body.position) {
      req.body.position = parseInt(req.body.position, 10);
    }
    req.body.updatedBy = req.account ? req.account.id : "";

    await Policy.updateOne({ _id: id }, req.body);

    req.flash("success", "Cập nhật nội dung chính sách thành công!");
    res.redirect(req.get("Referer") || `/${variableConfig.pathAdmin}/policy/list`);
  } catch (error) {
    console.error("Admin policy editPatch error:", error);
    req.flash("error", "Lỗi cập nhật chính sách!");
    res.redirect(`/${variableConfig.pathAdmin}/policy/list`);
  }
};
