const variableCongfig = require("../../config/variable");
const Account = require("../../models/Account.model");

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
      req.account = account;
      res.locals.account = account;
      next();
    }
  }
};
