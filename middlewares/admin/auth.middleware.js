const variableCongfig = require("../../config/variable");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");

module.exports.requireAuth = async (req, res, next) => {
  if (!req.cookies.token) {
    req.flash("error", "Vui lòng đăng nhập");
    res.redirect(`/${variableCongfig.pathAdmin}/auth/login`);
  } else {
    const account = await Account.findOne({
      token: req.cookies.token,
      status: "active",
      deleted: false,
    });
    if (!account) {
      req.flash("error", "Vui lòng đăng nhập");
      res.redirect(`/${variableCongfig.pathAdmin}/auth/login`);
    } else {
      const role = await Role.findOne({
        _id: account.role_id,
        deleted: false,
      }).select("name permissions");

      req.account = account;
      res.locals.account = account;
      res.locals.role = role;
      next();
    }
  }
};
