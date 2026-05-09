const md5 = require("md5");
const Account = require("../../models/account.model");
module.exports.edit = (req, res) => {
  res.render("admin/pages/profile-edit.pug", {
    title: "Chỉnh sửa hồ sơ",
  });
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.account.id;

    if (req.body.email) {
      const emailExist = await Account.findOne({
        _id: { $ne: id },
        email: req.body.email,
        deleted: false,
      });

      if (emailExist) {
        req.flash("error", "Email đã tồn tại!");
        res.redirect(req.get("Referer"));
        return;
      }
    }

    if (req.file) {
      req.body.avatar = req.file.path;
    }

    await Account.updateOne({ _id: id }, req.body);

    req.flash("success", "Cập nhật thông tin hồ sơ thành công!");
    res.redirect(req.get("Referer"));
  } catch (error) {
    console.log(error);
    req.flash("error", "Đã có lỗi xảy ra, vui lòng thử lại!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.changePassword = (req, res) => {
  res.render("admin/pages/profile-change-password.pug", {
    title: "Đổi mật khẩu",
  });
};

module.exports.changePasswordPatch = async (req, res) => {
  try {
    const id = req.account.id;

    await Account.updateOne({ _id: id }, { password: md5(req.body.password) });

    req.flash("success", "Đổi mật khóa thành cong!");
    res.redirect(req.get("Referer"));
  } catch (error) {
    console.log(error);
    req.flash("error", "Đã có lỗi xảy ra, vui lòng thử lại!");
    res.redirect(req.get("Referer"));
  }
};
