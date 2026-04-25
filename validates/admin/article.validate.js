module.exports.createPost = (req, res, next) => {
  if (!req.body.title || req.body.title.trim() === "") {
    req.flash("error", "Vui lòng nhập tiêu đề bài viết!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (req.body.title.trim().length < 5) {
    req.flash("error", "Tiêu đề phải ít nhất 5 ký tự!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (!req.body.content || req.body.content.trim() === "") {
    req.flash("error", "Nội dung không được để trống!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);

    if (isNaN(positionInt) || positionInt < 1) {
      req.flash("error", "Vị trí phải là số >= 1!");
      res.redirect(req.get("Referer"));
      return;
    }

    req.body.position = positionInt;
  }

  if (!req.file) {
    req.flash("error", "Vui lòng chọn ảnh đại diện!");
    res.redirect(req.get("Referer"));
    return;
  }

  req.body.title = req.body.title.trim();
  req.body.content = req.body.content.trim();

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};
