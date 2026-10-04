const User = require("../../models/user.model");
const jwtHelper = require("../../helpers/jwt.helper");

module.exports.infoUser = async (req, res, next) => {
  const token = req.cookies.tokenUser || req.cookies.token;

  if (token) {
    let user = null;

    // Verify JWT
    const decoded = jwtHelper.verifyToken(token);
    if (decoded && decoded.userId) {
      user = await User.findOne({
        _id: decoded.userId,
        deleted: false,
        status: "active",
      }).select("-password");
    }

    // Fallback token cũ trong database
    if (!user) {
      user = await User.findOne({
        token: token,
        deleted: false,
        status: "active",
      }).select("-password");
    }

    if (user) {
      req.user = user;
      res.locals.user = user;
    } else {
      res.clearCookie("tokenUser");
      res.clearCookie("token");
    }
  }

  next();
};
