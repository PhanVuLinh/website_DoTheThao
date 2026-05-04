module.exports.orderPost = (req, res, next) => {
  const { fullName, phone, address, paymentMethod } = req.body;

  if (!fullName || fullName.trim() === "") {
    req.flash("error", "Vui lòng nhập họ và tên!");
    req.flash("oldData", req.body); 
    return res.redirect(req.get("Referer"));
  }

  if (fullName.trim().length < 2) {
    req.flash("error", "Họ và tên phải ít nhất 2 ký tự!");
    req.flash("oldData", req.body);
    return res.redirect(req.get("Referer"));
  }

  if (!phone || phone.trim() === "") {
    req.flash("error", "Vui lòng nhập số điện thoại!");
    req.flash("oldData", req.body);
    return res.redirect(req.get("Referer"));
  }

  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    req.flash("error", "Số điện thoại không hợp lệ!");
    req.flash("oldData", req.body);
    return res.redirect(req.get("Referer"));
  }

  if (!address || address.trim() === "") {
    req.flash("error", "Vui lòng nhập địa chỉ!");
    req.flash("oldData", req.body);
    return res.redirect(req.get("Referer"));
  }

  if (!paymentMethod) {
    req.flash("error", "Vui lòng chọn phương thức thanh toán!");
    req.flash("oldData", req.body);
    return res.redirect(req.get("Referer"));
  }

  next();
};
