const Account = require("../../models/account.model");
const passwordHelper = require("../../helpers/password.helper");

module.exports.edit = (req, res) => {
  res.render("admin/pages/profile-edit.pug", {
    title: "Chỉnh sửa hồ sơ",
  });
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.account.id;

    // Mass assignment prevention: only allow specific safe fields
    const updateData = {};
    if (req.body.fullName) updateData.fullName = req.body.fullName.trim();
    if (req.body.phone) updateData.phone = req.body.phone.trim();
    if (req.file) updateData.avatar = req.file.path;

    if (req.body.email) {
      const email = req.body.email.trim();
      const emailExist = await Account.findOne({
        _id: { $ne: id },
        email: email,
        deleted: false,
      });

      if (emailExist) {
        req.flash("error", "Email đã tồn tại!");
        return res.redirect(req.get("Referer") || "/admin/profile/edit");
      }
      updateData.email = email;
    }

    await Account.updateOne({ _id: id }, updateData);

    req.flash("success", "Cập nhật thông tin hồ sơ thành công!");
    return res.redirect(req.get("Referer") || "/admin/profile/edit");
  } catch (error) {
    console.error("Profile Edit Error:", error);
    req.flash("error", "Đã có lỗi xảy ra, vui lòng thử lại!");
    return res.redirect(req.get("Referer") || "/admin/profile/edit");
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
    const password = req.body.password;

    if (!password || password.length < 6) {
      req.flash("error", "Mật khẩu phải chứa ít nhất 6 ký tự!");
      return res.redirect(req.get("Referer") || "/admin/profile/change-password");
    }

    const hashedPassword = await passwordHelper.hashPassword(password);
    await Account.updateOne({ _id: id }, { password: hashedPassword });

    req.flash("success", "Đổi mật khẩu thành công!");
    return res.redirect(req.get("Referer") || "/admin/profile/change-password");
  } catch (error) {
    console.error("Change Password Error:", error);
    req.flash("error", "Đã có lỗi xảy ra, vui lòng thử lại!");
    return res.redirect(req.get("Referer") || "/admin/profile/change-password");
  }
};
