module.exports.createPost = (req, res, next) => {
  if (!req.body.title || req.body.title.trim() === "") {
    req.flash("error", "Vui lòng nhập tên danh mục!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (req.body.title.trim().length < 3) {
    req.flash("error", "Tên danh mục phải chứa ít nhất 3 ký tự!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (req.body.position) {
    const positionInt = parseInt(req.body.position);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flash("error", "Vị trí phải là số nguyên lớn hơn hoặc bằng 1!");
      res.redirect(req.get("Referer"));
      return;
    }
  }

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }
  next();
};
