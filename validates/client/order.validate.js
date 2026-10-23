module.exports.orderPost = (req, res, next) => {
  const referer = req.get("Referer") || "/cart";
  const { fullName, phone, address, paymentMethod } = req.body;

  // 1. Họ và tên
  if (!fullName || fullName.trim() === "") {
    req.flashFormError("fullName", "Vui lòng nhập họ và tên người nhận hàng!");
    return res.redirect(referer);
  }

  if (fullName.trim().length < 2) {
    req.flashFormError("fullName", "Họ và tên người nhận cần có ít nhất 2 ký tự!");
    return res.redirect(referer);
  }
  req.body.fullName = fullName.trim();

  // 2. Số điện thoại (chấp nhận cả số có khoảng cách, gạch nối ví dụ 0987 123 456)
  if (!phone || phone.trim() === "") {
    req.flashFormError("phone", "Vui lòng cung cấp số điện thoại liên hệ nhận hàng!");
    return res.redirect(referer);
  }

  const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, "");
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  if (!phoneRegex.test(cleanPhone)) {
    req.flashFormError("phone", "Số điện thoại nhận hàng không đúng định dạng (Ví dụ: 0912345678)!");
    return res.redirect(referer);
  }
  req.body.phone = cleanPhone;

  // 3. Địa chỉ giao hàng
  if (!address || address.trim() === "") {
    req.flashFormError("address", "Vui lòng cung cấp địa chỉ giao hàng cụ thể!");
    return res.redirect(referer);
  }
  req.body.address = address.trim();

  // 4. Phương thức thanh toán
  if (!paymentMethod || paymentMethod.trim() === "") {
    req.body.paymentMethod = "cod"; // Fallback mặc định thanh toán khi nhận hàng nếu chưa chọn
  }

  if (req.body.note) {
    req.body.note = req.body.note.trim();
  }

  next();
};
