module.exports.createPost = (req, res, next) => {
  // 1. Title
  if (!req.body.title || req.body.title.trim() === "") {
    req.flashFormError("title", "Vui lòng nhập tên chiến dịch Flash Sale!");
    return res.redirect(req.get("Referer"));
  }
  req.body.title = req.body.title.trim();

  // 2. Start Time
  if (!req.body.startTime) {
    req.flashFormError("startTime", "Vui lòng chọn thời gian bắt đầu!");
    return res.redirect(req.get("Referer"));
  }
  const startDate = new Date(req.body.startTime);
  if (isNaN(startDate.getTime())) {
    req.flashFormError("startTime", "Thời gian bắt đầu không hợp lệ!");
    return res.redirect(req.get("Referer"));
  }

  // 3. End Time
  if (!req.body.endTime) {
    req.flashFormError("endTime", "Vui lòng chọn thời gian kết thúc!");
    return res.redirect(req.get("Referer"));
  }
  const endDate = new Date(req.body.endTime);
  if (isNaN(endDate.getTime())) {
    req.flashFormError("endTime", "Thời gian kết thúc không hợp lệ!");
    return res.redirect(req.get("Referer"));
  }

  if (endDate <= startDate) {
    req.flashFormError("endTime", "Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
    return res.redirect(req.get("Referer"));
  }

  // 4. Products check (at least 1 product selected)
  const hasProductIds =
    (Array.isArray(req.body.product_id) && req.body.product_id.length > 0) ||
    (typeof req.body.product_id === "string" && req.body.product_id.trim() !== "");

  const hasProductsArray =
    Array.isArray(req.body.products) && req.body.products.length > 0;

  if (!hasProductIds && !hasProductsArray) {
    req.flash("error", "Vui lòng chọn ít nhất 1 sản phẩm tham gia chiến dịch Flash Sale!");
    return res.redirect(req.get("Referer"));
  }

  next();
};
