module.exports.orderPost = (req, res, next) => {
  const { fullName, phone, address, paymentMethod } = req.body;

  if (!fullName || fullName.trim() === "") {
    req.flashFormError("fullName", "Vui lòng nhập họ và tên!");
    return res.redirect(req.get("Referer"));
  }

  if (fullName.trim().length < 2) {
    req.flashFormError("fullName", "Họ và tên phải có ít nhất 2 ký tự!");
    return res.redirect(req.get("Referer"));
  }

  if (!phone || phone.trim() === "") {
    req.flashFormError("phone", "Vui lòng nhập số điện thoại!");
    return res.redirect(req.get("Referer"));
  }

  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    req.flashFormError("phone", "Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu bằng 0)!");
    return res.redirect(req.get("Referer"));
  }

  if (!address || address.trim() === "") {
    req.flashFormError("address", "Vui lòng nhập địa chỉ nhận hàng chi tiết!");
    return res.redirect(req.get("Referer"));
  }

  if (!paymentMethod) {
    req.flashFormError("paymentMethod", "Vui lòng chọn phương thức thanh toán!");
    return res.redirect(req.get("Referer"));
  }

  next();
};
