module.exports.createPost = (req, res, next) => {
  const referer = req.get("Referer") || "/admin/article/list";

  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tiêu đề bài viết!");
    return res.redirect(referer);
  }

  if (req.body.title.trim().length < 3) {
    req.flashFormError("title", "Tiêu đề bài viết phải có ít nhất 3 ký tự!");
    return res.redirect(referer);
  }

  if (!req.body.content || req.body.content.trim() === "") {
    req.flashFormError("content", "Nội dung bài viết không được để trống!");
    return res.redirect(referer);
  }

  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flashFormError("position", "Vị trí phải là số lớn hơn hoặc bằng 1!");
      return res.redirect(referer);
    }
    req.body.position = positionInt;
  }

  req.body.title = req.body.title.trim();
  req.body.content = req.body.content.trim();

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};

module.exports.editPost = (req, res, next) => {
  const referer = req.get("Referer") || "/admin/article/list";

  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tiêu đề bài viết!");
    return res.redirect(referer);
  }

  if (req.body.title.trim().length < 3) {
    req.flashFormError("title", "Tiêu đề bài viết phải có ít nhất 3 ký tự!");
    return res.redirect(referer);
  }

  if (!req.body.content || req.body.content.trim() === "") {
    req.flashFormError("content", "Nội dung bài viết không được để trống!");
    return res.redirect(referer);
  }

  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flashFormError("position", "Vị trí phải là số lớn hơn hoặc bằng 1!");
      return res.redirect(referer);
    }
    req.body.position = positionInt;
  }

  req.body.title = req.body.title.trim();
  req.body.content = req.body.content.trim();

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};
