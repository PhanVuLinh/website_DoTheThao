module.exports.createPost = (req, res, next) => {
  if (!req.body.title || req.body.title.trim() === "") {
    req.flash("error", "Vui lòng nhập tên sản phẩm!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (req.body.title.trim().length < 3) {
    req.flash("error", "Tên sản phẩm phải chứa ít nhất 3 ký tự!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flash("error", "Vị trí phải là số nguyên lớn hơn hoặc bằng 1!");
      res.redirect(req.get("Referer"));
      return;
    }
  }

  if (req.body.sizes && Array.isArray(req.body.sizes)) {
    for (let i = 0; i < req.body.sizes.length; i++) {
      const item = req.body.sizes[i];


      if (!item.stock || item.stock === "") {
        req.flash("error", `Tồn kho không được để trống!`);
        res.redirect(req.get("Referer"));
        return;
      }

      const stockInt = parseInt(item.stock, 10);

      if (isNaN(stockInt) || stockInt < 0) {
        req.flash("error", `Tồn kho phải là số >= 0`);
        res.redirect(req.get("Referer"));
        return;
      }

      item.stock = stockInt;
    }
  } else {
    req.flash("error", "Vui lòng thêm ít nhất một size!");
    res.redirect(req.get("Referer"));
    return;
  }

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};
