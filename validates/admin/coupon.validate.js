module.exports.createPost = (req, res, next) => {
  // 1. Title
  if (!req.body.title || req.body.title.trim() === "") {
    req.flash("error", "Vui lòng nhập tên sự kiện!");
    return res.redirect(req.get("Referer"));
  }
  req.body.title = req.body.title.trim();

  // 2. Code
  if (!req.body.code || req.body.code.trim() === "") {
    req.flash("error", "Vui lòng nhập mã giảm giá!");
    return res.redirect(req.get("Referer"));
  }
  req.body.code = req.body.code.trim().toUpperCase();

  // 3. Discount %
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  if (
    isNaN(req.body.discountPercentage) ||
    req.body.discountPercentage < 0 ||
    req.body.discountPercentage > 100
  ) {
    req.flash("error", "Phần trăm giảm phải từ 0 đến 100!");
    return res.redirect(req.get("Referer"));
  }

  // 4. Max discount
  req.body.maxDiscountAmount = parseInt(req.body.maxDiscountAmount);
  if (isNaN(req.body.maxDiscountAmount) || req.body.maxDiscountAmount < 0) {
    req.flash("error", "Giảm tối đa phải >= 0!");
    return res.redirect(req.get("Referer"));
  }

  // 5. Quantity
  req.body.quantity = parseInt(req.body.quantity);
  if (isNaN(req.body.quantity) || req.body.quantity < 1) {
    req.flash("error", "Số lượng phải >= 1!");
    return res.redirect(req.get("Referer"));
  }

  // 6. Expiration date
  if (!req.body.expirationDate) {
    req.flash("error", "Vui lòng chọn ngày hết hạn!");
    return res.redirect(req.get("Referer"));
  }

  const now = new Date();
  const expDate = new Date(req.body.expirationDate);

  if (expDate < now) {
    req.flash("error", "Ngày hết hạn phải lớn hơn hiện tại!");
    return res.redirect(req.get("Referer"));
  }

  // 7. Status mặc định
  if (!req.body.status) {
    req.body.status = "active";
  }

  next();
};
