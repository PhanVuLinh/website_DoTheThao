const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Coupon = require("../../models/coupon.model");
const User = require("../../models/user.model");

const productsHelper = require("../../helpers/getPriceNew.helper");

module.exports.cart = async (req, res) => {
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({ _id: cartId });
  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const productId = item.product_id;
      const productInfo = await Product.findOne({
        _id: productId,
        deleted: false,
      }).select("title thumbnail price slug discountPercentage");

      productsHelper.priceNewOne(productInfo);
      item.productInfo = productInfo;
      item.totalPrice = productInfo.priceNew * item.quantity;
    }
  }
  cart.totalPrice = cart.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  cart.discountAmount = 0;
  cart.totalPayment = cart.totalPrice;
  if (cart.coupon && cart.coupon.code) {
    const couponInfo = await Coupon.findOne({
      code: cart.coupon.code,
      deleted: false,
      status: "active",
    });

    if (
      couponInfo &&
      couponInfo.quantity > 0 &&
      new Date() <= new Date(couponInfo.expirationDate)
    ) {
      let discount = (cart.totalPrice * couponInfo.discountPercentage) / 100;
      if (discount > couponInfo.maxDiscountAmount) {
        discount = couponInfo.maxDiscountAmount;
      }
      cart.discountAmount = discount;
      cart.totalPayment = cart.totalPrice - discount;

      // BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ JAVASCRIPT LẤY ĐƯỢC % TÍNH TOÁN LẠI
      cart.couponInfo = couponInfo;
    } else {
      // Xóa mã nếu hết hạn
      await Cart.updateOne(
        { _id: cartId },
        { $set: { "coupon.code": "", "coupon.discount": 0 } },
      );
      cart.coupon.code = "";
    }
  }
  res.render("client/pages/cart.pug", {
    title: "Giỏ hàng",
    cartDetail: cart,
  });
};

module.exports.addToCart = async (req, res) => {
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity);
  const size = req.body.size;
  const cartId = req.cookies.cartId;

  const productInfo = await Product.findOne({
    _id: productId,
    deleted: false,
  });

  if (!productInfo) {
    req.flash("error", "Sản phẩm không tồn tại!");
    return res.redirect(req.get("Referer"));
  }

  const sizeItem = productInfo.sizes.find((item) => item.size === size);

  if (!sizeItem) {
    req.flash("error", "Size không tồn tại!");
    return res.redirect(req.get("Referer"));
  }
  if (sizeItem.stock <= 0) {
    req.flash("error", "Sản phẩm đã hết hàng!");
    return res.redirect(req.get("Referer"));
  }

  const cart = await Cart.findOne({ _id: cartId });

  const existProductInCart = cart.products.find(
    (item) => item.product_id === productId && item.size === size,
  );

  let newQuantity = quantity;

  if (existProductInCart) {
    newQuantity += existProductInCart.quantity;
  }
  if (newQuantity > sizeItem.stock) {
    req.flash("error", `Chỉ còn ${sizeItem.stock} sản phẩm trong kho!`);
    return res.redirect(req.get("Referer"));
  }
  if (existProductInCart) {
    await Cart.updateOne(
      {
        _id: cartId,
        "products.product_id": productId,
        "products.size": size,
      },
      { $set: { "products.$.quantity": newQuantity } },
    );
  } else {
    const objectCart = {
      product_id: productId,
      quantity: quantity,
      size: size,
    };
    await Cart.updateOne({ _id: cartId }, { $push: { products: objectCart } });
  }

  req.flash("success", "Thêm vào giỏ hàng thành công");
  res.redirect(req.get("Referer"));
};

module.exports.deleteProduct = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;

  await Cart.updateOne(
    { _id: cartId },
    {
      $pull: { products: { product_id: productId } },
    },
  );

  req.flash("success", "xóa sản phẩm thành công");
  res.redirect(req.get("Referer"));
};

module.exports.updateQuantity = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;
  const quantity = req.params.quantity;

  const cart = await Cart.findOne({ _id: cartId });
  const item = cart.products.find((item) => item.product_id === productId);

  const productInfo = await Product.findOne({
    _id: productId,
    deleted: false,
  });

  const sizeItem = productInfo.sizes.find((s) => s.size === item.size);

  if (quantity > sizeItem.stock) {
    return res.json({
      success: false,
      message: `Chỉ còn ${sizeItem.stock} sản phẩm trong kho!`,
    });
  }
  await Cart.updateOne(
    {
      _id: cartId,
      "products.product_id": productId,
    },
    {
      $set: { "products.$.quantity": quantity },
    },
  );

  res.json({ success: true });
};

module.exports.applyCoupon = async (req, res) => {
  try {
    const code = req.body.code;
    const cartId = req.cookies.cartId;

    if (!req.cookies.token) {
      return res.json({ code: 400, message: "Vui lòng đăng nhập để dùng mã!" });
    }

    const user = await User.findOne({
      token: req.cookies.token,
      deleted: false,
    });
    const coupon = await Coupon.findOne({
      code: code,
      deleted: false,
      status: "active",
    });

    if (!coupon) return res.json({ code: 400, message: "Mã không hợp lệ!" });
    if (coupon.quantity <= 0)
      return res.json({ code: 400, message: "Mã đã hết lượt dùng!" });
    if (new Date() > new Date(coupon.expirationDate))
      return res.json({ code: 400, message: "Mã đã hết hạn!" });

    // Kiểm tra usedBy an toàn (tránh lỗi includes trên undefined)
    if (coupon.usedBy && coupon.usedBy.includes(user.id)) {
      return res.json({ code: 400, message: "Bạn đã sử dụng mã này rồi!" });
    }

    await Cart.updateOne(
      { _id: cartId },
      {
        $set: {
          "coupon.code": code,
          "coupon.discount": coupon.discountPercentage,
        },
      },
    );

    // Trả về JSON để Frontend nhận diện và reload
    return res.json({ code: 200, message: "Áp dụng thành công!" });
  } catch (error) {
    console.log(error);
    return res.json({ code: 500, message: "Lỗi hệ thống!" });
  }
};

module.exports.removeCoupon = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    await Cart.updateOne(
      { _id: cartId },
      { $set: { "coupon.code": "", "coupon.discount": 0 } },
    );
    // Trả về phản hồi ngay lập tức để xóa lỗi "Failed to fetch"
    return res.json({ code: 200, message: "Đã xóa mã!" });
  } catch (error) {
    return res.json({ code: 500, message: "Lỗi hệ thống!" });
  }
};
