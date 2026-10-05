module.exports.createPost = (req, res, next) => {
  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tiêu đề bài viết!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.title.trim().length < 5) {
    req.flashFormError("title", "Tiêu đề phải ít nhất 5 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (!req.body.content || req.body.content.trim() === "") {
    req.flashFormError("content", "Nội dung bài viết không được để trống!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flashFormError("position", "Vị trí phải là số >= 1!");
      return res.redirect(req.get("Referer"));
    }
    req.body.position = positionInt;
  }

  if (!req.file) {
    req.flashFormError("thumbnail", "Vui lòng chọn ảnh đại diện cho bài viết!");
    return res.redirect(req.get("Referer"));
  }

  req.body.title = req.body.title.trim();
  req.body.content = req.body.content.trim();

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};

module.exports.editPost = (req, res, next) => {
  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tiêu đề bài viết!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.title.trim().length < 5) {
    req.flashFormError("title", "Tiêu đề phải ít nhất 5 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (!req.body.content || req.body.content.trim() === "") {
    req.flashFormError("content", "Nội dung không được để trống!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flashFormError("position", "Vị trí phải là số >= 1!");
      return res.redirect(req.get("Referer"));
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
