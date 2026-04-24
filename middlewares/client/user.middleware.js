const User = require("../../models/user.model");
module.exports.infoUser = async (req, res, next) => {
  if (req.cookies.token) {
    const user = await User.findOne({
      token: req.cookies.token,
      deleted: false,
      status: "active",
    }).select("-password");
    if (user) {
      res.locals.user = user;
    }
  }
  next();
};
