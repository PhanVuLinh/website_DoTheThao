module.exports.createPost = (req, res, next) => {
  if (!req.body.name || req.body.name.trim() === "") {
    req.flashFormError("name", "Vui lòng nhập tên nhóm quyền!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.name.trim().length < 2) {
    req.flashFormError("name", "Tên nhóm quyền phải chứa ít nhất 2 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};