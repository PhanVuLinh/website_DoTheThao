module.exports.createPost = (req, res, next) => {
  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tên danh mục!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.title.trim().length < 3) {
    req.flashFormError("title", "Tên danh mục phải chứa ít nhất 3 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flashFormError("position", "Vị trí phải là số nguyên lớn hơn hoặc bằng 1!");
      return res.redirect(req.get("Referer"));
    }
  }

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }
  next();
};
