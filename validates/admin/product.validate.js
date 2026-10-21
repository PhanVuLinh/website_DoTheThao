module.exports.createPost = (req, res, next) => {
  const referer = req.get("Referer") || "/admin/product/list";

  // 1. Tên sản phẩm
  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tên sản phẩm!");
    return res.redirect(referer);
  }

  if (req.body.title.trim().length < 2) {
    req.flashFormError("title", "Tên sản phẩm phải chứa ít nhất 2 ký tự!");
    return res.redirect(referer);
  }
  req.body.title = req.body.title.trim();

  // 2. Giá sản phẩm
  if (req.body.price === undefined || req.body.price === "") {
    req.flashFormError("price", "Vui lòng nhập giá sản phẩm!");
    return res.redirect(referer);
  }
  const cleanPrice = String(req.body.price).replace(/\D/g, "");
  const priceInt = parseInt(cleanPrice, 10);
  if (isNaN(priceInt) || priceInt < 0) {
    req.flashFormError("price", "Giá sản phẩm phải là một số không âm (>= 0)!");
    return res.redirect(referer);
  }
  req.body.price = priceInt;

  // 3. Giảm giá (%)
  if (req.body.discountPercentage !== undefined && req.body.discountPercentage !== "") {
    const discountInt = parseInt(req.body.discountPercentage, 10);
    if (isNaN(discountInt) || discountInt < 0 || discountInt > 100) {
      req.flashFormError("discountPercentage", "Phần trăm giảm giá phải nằm trong khoảng từ 0% đến 100%!");
      return res.redirect(referer);
    }
    req.body.discountPercentage = discountInt;
  } else {
    req.body.discountPercentage = 0;
  }

  // 4. Vị trí hiển thị (tùy chọn)
  if (req.body.position) {
    const positionInt = parseInt(req.body.position, 10);
    if (isNaN(positionInt) || positionInt < 1) {
      req.flashFormError("position", "Vị trí phải là số nguyên lớn hơn hoặc bằng 1!");
      return res.redirect(referer);
    }
    req.body.position = positionInt;
  }

  // 5. Quản lý Size & Tồn kho thông minh
  if (req.body.sizes && Array.isArray(req.body.sizes)) {
    // Lọc bỏ các dòng hoàn toàn rỗng nếu người dùng vô tình bấm thêm size nhưng không điền
    const validSizes = req.body.sizes.filter(
      (item) => item && (item.size || (item.stock !== undefined && item.stock !== ""))
    );

    for (let i = 0; i < validSizes.length; i++) {
      const item = validSizes[i];

      // Cho phép stock = 0 (hàng tạm hết), chỉ báo lỗi khi bỏ trống hoàn toàn
      if (item.stock === undefined || item.stock === null || String(item.stock).trim() === "") {
        req.flashFormError("sizes", `Tồn kho của size "${item.size || i + 1}" không được để trống!`);
        return res.redirect(referer);
      }

      const stockInt = parseInt(item.stock, 10);
      if (isNaN(stockInt) || stockInt < 0) {
        req.flashFormError("sizes", `Tồn kho của size "${item.size || i + 1}" phải là số lớn hơn hoặc bằng 0!`);
        return res.redirect(referer);
      }

      item.stock = stockInt;
      item.size = (item.size && item.size.trim()) ? item.size.trim() : "Tiêu chuẩn";
    }

    if (validSizes.length > 0) {
      req.body.sizes = validSizes;
    } else {
      // Nếu sản phẩm không phân loại size (ví dụ: bóng đá, phụ kiện, bình nước), tạo 1 size mặc định
      req.body.sizes = [{ size: "Tiêu chuẩn", stock: 0 }];
    }
  } else {
    // Fallback an toàn cho sản phẩm một kích cỡ
    req.body.sizes = [{ size: "Tiêu chuẩn", stock: 0 }];
  }

  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};
