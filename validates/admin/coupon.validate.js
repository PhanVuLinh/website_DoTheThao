module.exports.createPost = (req, res, next) => {
  // 1. Title
  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tên sự kiện!");
    return res.redirect(req.get("Referer"));
  }
  req.body.title = req.body.title.trim();

  // 2. Code
  if (!req.body.code || req.body.code.trim() === "") {
    req.flashFormError("code", "Vui lòng nhập mã giảm giá!");
    return res.redirect(req.get("Referer"));
  }
  req.body.code = req.body.code.trim().toUpperCase();

  // 3. Discount %
  req.body.discountPercentage = parseInt(req.body.discountPercentage, 10);
  if (
    isNaN(req.body.discountPercentage) ||
    req.body.discountPercentage < 0 ||
    req.body.discountPercentage > 100
  ) {
    req.flashFormError("discountPercentage", "Phần trăm giảm phải từ 0 đến 100!");
    return res.redirect(req.get("Referer"));
  }

  // 4. Max discount
  req.body.maxDiscountAmount = parseInt(req.body.maxDiscountAmount, 10);
  if (isNaN(req.body.maxDiscountAmount) || req.body.maxDiscountAmount < 0) {
    req.flashFormError("maxDiscountAmount", "Giảm tối đa phải >= 0!");
    return res.redirect(req.get("Referer"));
  }

  // 5. Quantity
  req.body.quantity = parseInt(req.body.quantity, 10);
  if (isNaN(req.body.quantity) || req.body.quantity < 1) {
    req.flashFormError("quantity", "Số lượng phải >= 1!");
    return res.redirect(req.get("Referer"));
  }

  // 6. Expiration date
  if (!req.body.expirationDate) {
    req.flashFormError("expirationDate", "Vui lòng chọn ngày hết hạn!");
    return res.redirect(req.get("Referer"));
  }

  const now = new Date();
  const expDate = new Date(req.body.expirationDate);

  if (expDate < now) {
    req.flashFormError("expirationDate", "Ngày hết hạn phải lớn hơn ngày hiện tại!");
    return res.redirect(req.get("Referer"));
  }

  // 7. Status mặc định
  if (!req.body.status) {
    req.body.status = "active";
  }

  next();
};
