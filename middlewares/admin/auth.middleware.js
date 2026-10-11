const variableCongfig = require("../../config/variable");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const jwtHelper = require("../../helpers/jwt.helper");

module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.tokenAdmin || req.cookies.token;

  if (!token) {
    req.flash("error", "Vui lòng đăng nhập");
    return res.redirect(`/${variableCongfig.pathAdmin}/auth/login`);
  }

  try {
    let account = null;

    // Verify JWT
    const decoded = jwtHelper.verifyToken(token);
    if (decoded && decoded.accountId) {
      account = await Account.findOne({
        _id: decoded.accountId,
        status: "active",
        deleted: false,
      });
    }

    // Fallback for legacy token during migration
    if (!account) {
      account = await Account.findOne({
        token: token,
        status: "active",
        deleted: false,
      });
    }

    if (!account) {
      res.clearCookie("tokenAdmin");
      res.clearCookie("token");
      req.flash("error", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn!");
      return res.redirect(`/${variableCongfig.pathAdmin}/auth/login`);
    }

    const role = await Role.findOne({
      _id: account.role_id,
      deleted: false,
    }).select("name permissions");

    req.account = account;
    res.locals.account = account;
    res.locals.role = role || { permissions: [] };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.clearCookie("tokenAdmin");
    res.clearCookie("token");
    req.flash("error", "Có lỗi xảy ra, vui lòng đăng nhập lại!");
    return res.redirect(`/${variableCongfig.pathAdmin}/auth/login`);
  }
};

// Middleware kiểm tra quyền RBAC trên từng route
module.exports.checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const role = (res && res.locals && res.locals.role) || (req && req.role);
    const permissions = (role && role.permissions) ? role.permissions : [];

    const isAllowed = Array.isArray(requiredPermission)
      ? requiredPermission.some((p) => permissions.includes(p))
      : permissions.includes(requiredPermission);

    if (!isAllowed) {
      if (req.xhr || (req.headers && req.headers.accept && req.headers.accept.includes("json"))) {
        return res.status(403).json({

          code: 403,
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này!",
        });
      }

      req.flash("error", "Bạn không có quyền thực hiện thao tác này!");
      const referer = req.get("Referer");
      if (referer && !referer.includes("/auth/login")) {
        return res.redirect(referer);
      }
      return res.redirect(`/${variableCongfig.pathAdmin}/dashboard`);
    }

    next();
  };
};
