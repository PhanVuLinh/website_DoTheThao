module.exports.createPost = (req, res, next) => {
  const referer = req.get("Referer") || "/admin/category/list";

  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tên danh mục!");
    return res.redirect(referer);
  }

  // Chấp nhận danh mục ngắn trong tiếng Việt như "Áo", "Vớ", "Tạ" (ít nhất 2 ký tự)
  if (req.body.title.trim().length < 2) {
    req.flashFormError("title", "Tên danh mục phải chứa ít nhất 2 ký tự!");
    return res.redirect(referer);
  }
  req.body.title = req.body.title.trim();

  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flashFormError("position", "Vị trí phải là số nguyên lớn hơn hoặc bằng 1!");
      return res.redirect(referer);
    }
    req.body.position = positionInt;
  }

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }
  next();
};
