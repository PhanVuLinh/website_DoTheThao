module.exports.createPost = (req, res, next) => {
  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tên sản phẩm!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.title.trim().length < 3) {
    req.flashFormError("title", "Tên sản phẩm phải chứa ít nhất 3 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.price === undefined || req.body.price === "") {
    req.flashFormError("price", "Vui lòng nhập giá sản phẩm!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flashFormError("position", "Vị trí phải là số nguyên lớn hơn hoặc bằng 1!");
      return res.redirect(req.get("Referer"));
    }
  }

  if (req.body.sizes && Array.isArray(req.body.sizes)) {
    for (let i = 0; i < req.body.sizes.length; i++) {
      const item = req.body.sizes[i];

      if (!item.stock || item.stock === "") {
        req.flashFormError("sizes", "Tồn kho không được để trống!");
        return res.redirect(req.get("Referer"));
      }

      const stockInt = parseInt(item.stock, 10);
      if (isNaN(stockInt) || stockInt < 0) {
        req.flashFormError("sizes", "Tồn kho phải là số lớn hơn hoặc bằng 0!");
        return res.redirect(req.get("Referer"));
      }

      item.stock = stockInt;
    }
  } else {
    req.flashFormError("sizes", "Vui lòng thêm ít nhất một size!");
    return res.redirect(req.get("Referer"));
  }

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};
