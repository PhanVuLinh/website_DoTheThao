module.exports.createPost = (req, res, next) => {
  if (!req.body.name || !req.body.name.trim()) {
    req.flash("error", "Vui lòng nhập tên thương hiệu!");
    return res.redirect(req.get("Referer") || "back");
  }
  next();
};

module.exports.editPost = (req, res, next) => {
  if (!req.body.name || !req.body.name.trim()) {
    req.flash("error", "Vui lòng nhập tên thương hiệu!");
    return res.redirect(req.get("Referer") || "back");
  }
  next();
};
