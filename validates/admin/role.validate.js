module.exports.createPost = (req, res, next) => {
  if (!req.body.name || req.body.name.trim() === "") {
    req.flash("error", "Vui lòng nhập tên nhóm quyền!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (req.body.name.trim().length < 2) {
    req.flash("error", "Tên nhóm quyền phải chứa ít nhất 2 ký tự!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};