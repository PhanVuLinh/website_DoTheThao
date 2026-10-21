module.exports.createPost = (req, res, next) => {
  const referer = req.get("Referer") || "/admin/coupon/list";
  const isEditing = Boolean(req.params.id);

  // 1. Title
  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tên sự kiện hoặc tên voucher!");
    return res.redirect(referer);
  }
  req.body.title = req.body.title.trim();

  // 2. Code
  if (!req.body.code || req.body.code.trim() === "") {
    req.flashFormError("code", "Vui lòng nhập mã giảm giá!");
    return res.redirect(referer);
  }
  req.body.code = req.body.code.trim().toUpperCase();

  // 3. Discount %
  req.body.discountPercentage = parseInt(req.body.discountPercentage, 10);
  if (
    isNaN(req.body.discountPercentage) ||
    req.body.discountPercentage < 0 ||
    req.body.discountPercentage > 100
  ) {
    req.flashFormError("discountPercentage", "Phần trăm giảm giá phải từ 0% đến 100%!");
    return res.redirect(referer);
  }

  // 4. Max discount amount (tùy chọn)
  if (req.body.maxDiscountAmount !== undefined && req.body.maxDiscountAmount !== "") {
    req.body.maxDiscountAmount = String(req.body.maxDiscountAmount).replace(/\D/g, "");
  }
  req.body.maxDiscountAmount = parseInt(req.body.maxDiscountAmount || 0, 10);
  if (isNaN(req.body.maxDiscountAmount) || req.body.maxDiscountAmount < 0) {
    req.flashFormError("maxDiscountAmount", "Số tiền giảm tối đa phải lớn hơn hoặc bằng 0!");
    return res.redirect(referer);
  }

  // 5. Quantity (Số lượt sử dụng)
  req.body.quantity = parseInt(req.body.quantity, 10);
  if (isNaN(req.body.quantity) || req.body.quantity < 1) {
    req.flashFormError("quantity", "Số lượng lượt sử dụng phải lớn hơn hoặc bằng 1!");
    return res.redirect(referer);
  }

  // 6. Expiration date
  if (!req.body.expirationDate) {
    req.flashFormError("expirationDate", "Vui lòng chọn ngày hết hạn!");
    return res.redirect(referer);
  }

  const expDate = new Date(req.body.expirationDate);
  if (isNaN(expDate.getTime())) {
    req.flashFormError("expirationDate", "Ngày hết hạn không đúng định dạng!");
    return res.redirect(referer);
  }

  // Chỉ bắt buộc ngày hết hạn > hiện tại khi tạo mới coupon; khi chỉnh sửa cho phép lưu để cập nhật thông tin khác
  if (!isEditing) {
    const now = new Date();
    if (expDate < now) {
      req.flashFormError("expirationDate", "Ngày hết hạn phải lớn hơn ngày hiện tại!");
      return res.redirect(referer);
    }
  }

  // 7. Status mặc định
  if (!req.body.status) {
    req.body.status = "active";
  }

  next();
};
