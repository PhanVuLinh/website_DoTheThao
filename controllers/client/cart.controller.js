const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Coupon = require("../../models/coupon.model");
const User = require("../../models/user.model");
const jwtHelper = require("../../helpers/jwt.helper");
const productsHelper = require("../../helpers/getPriceNew.helper");

module.exports.cart = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    if (!cartId) {
      return res.redirect("/");
    }

    const cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      return res.redirect("/");
    }

    if (cart.products && cart.products.length > 0) {
      const validProducts = [];
      for (const item of cart.products) {
        const productId = item.product_id;
        const productInfo = await Product.findOne({
          _id: productId,
          deleted: false,
        }).select("title thumbnail price slug discountPercentage sizes");

        if (productInfo) {
          productsHelper.priceNewOne(productInfo);
          item.productInfo = productInfo;
          item.totalPrice = productInfo.priceNew * item.quantity;
          validProducts.push(item);
        }
      }
      cart.products = validProducts;
    } else {
      cart.products = [];
    }

    cart.totalPrice = cart.products.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0,
    );

    cart.discountAmount = 0;
    let subtotalAfterDiscount = cart.totalPrice;

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
        subtotalAfterDiscount = Math.max(0, cart.totalPrice - discount);
        cart.couponInfo = couponInfo;
      } else {
        // Xóa mã nếu hết hạn hoặc không còn hiệu lực
        await Cart.updateOne(
          { _id: cartId },
          { $set: { "coupon.code": "", "coupon.discount": 0 } },
        );
        cart.coupon.code = "";
      }
    }

    // Tính phí vận chuyển theo cấu hình Admin (Setting Website)
    const settingInfo = res.locals.settingWebsiteInfo || {};
    const standardShipping = settingInfo.shippingFee !== undefined ? settingInfo.shippingFee : 30000;
    const freeThreshold = settingInfo.freeShippingThreshold !== undefined ? settingInfo.freeShippingThreshold : 500000;

    const isFreeShipping = cart.totalPrice > 0 && subtotalAfterDiscount >= freeThreshold;
    const shippingFee = cart.totalPrice > 0 ? (isFreeShipping ? 0 : standardShipping) : 0;

    cart.shippingFee = shippingFee;
    cart.isFreeShipping = isFreeShipping;
    cart.freeShippingThreshold = freeThreshold;
    cart.totalPayment = subtotalAfterDiscount + shippingFee;

    res.render("client/pages/cart.pug", {
      title: "Giỏ hàng",
      cartDetail: cart,
      oldData: req.flash("oldData")[0] || {},
    });
  } catch (error) {
    console.error("Cart error:", error);
    req.flash("error", "Đã có lỗi xảy ra khi tải giỏ hàng!");
    return res.redirect("/");
  }
};

module.exports.addToCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity, 10);
    const size = (req.body.size || "").trim();
    const cartId = req.cookies.cartId;

    if (isNaN(quantity) || quantity < 1) {
      req.flash("error", "Số lượng sản phẩm không hợp lệ!");
      return res.redirect(req.get("Referer") || "/");
    }

    const productInfo = await Product.findOne({
      _id: productId,
      deleted: false,
    });

    if (!productInfo) {
      req.flash("error", "Sản phẩm không tồn tại!");
      return res.redirect(req.get("Referer") || "/");
    }

    const sizeItem = (productInfo.sizes || []).find((item) => item.size === size);

    if (!sizeItem) {
      req.flash("error", "Size không tồn tại!");
      return res.redirect(req.get("Referer") || "/");
    }
    if (sizeItem.stock <= 0) {
      req.flash("error", "Sản phẩm kích thước này đã hết hàng!");
      return res.redirect(req.get("Referer") || "/");
    }

    const cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      req.flash("error", "Giỏ hàng không hợp lệ!");
      return res.redirect(req.get("Referer") || "/");
    }

    const existProductInCart = cart.products.find(
      (item) => item.product_id === productId && item.size === size,
    );

    let newQuantity = quantity;

    if (existProductInCart) {
      newQuantity += existProductInCart.quantity;
    }
    if (newQuantity > sizeItem.stock) {
      req.flash("error", `Chỉ còn ${sizeItem.stock} sản phẩm trong kho!`);
      return res.redirect(req.get("Referer") || "/");
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
    res.redirect(req.get("Referer") || "/cart");
  } catch (error) {
    console.error("addToCart error:", error);
    req.flash("error", "Lỗi thêm vào giỏ hàng!");
    res.redirect(req.get("Referer") || "/");
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const size = req.query.size;

    const pullCondition = size
      ? { product_id: productId, size: size }
      : { product_id: productId };

    await Cart.updateOne(
      { _id: cartId },
      {
        $pull: { products: pullCondition },
      },
    );

    req.flash("success", "Xóa sản phẩm thành công");
    res.redirect(req.get("Referer") || "/cart");
  } catch (error) {
    console.error("deleteProduct error:", error);
    req.flash("error", "Lỗi xóa sản phẩm!");
    res.redirect(req.get("Referer") || "/cart");
  }
};

module.exports.updateQuantity = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const quantity = parseInt(req.params.quantity, 10);
    const size = req.query.size;

    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Số lượng sản phẩm tối thiểu là 1!",
      });
    }

    const cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại!" });
    }

    const item = cart.products.find(
      (p) => p.product_id === productId && (!size || p.size === size),
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Sản phẩm không có trong giỏ hàng!" });
    }

    const productInfo = await Product.findOne({
      _id: productId,
      deleted: false,
    });

    if (!productInfo) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại hoặc đã bị xóa!" });
    }

    const sizeItem = (productInfo.sizes || []).find((s) => s.size === item.size);
    if (!sizeItem) {
      return res.status(400).json({ success: false, message: "Size sản phẩm không tồn tại!" });
    }

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
        "products.size": item.size,
      },
      {
        $set: { "products.$.quantity": quantity },
      },
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("updateQuantity error:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
  }
};

module.exports.applyCoupon = async (req, res) => {
  try {
    const code = (req.body.code || "").trim();
    const cartId = req.cookies.cartId;
    const token = req.cookies.tokenUser || req.cookies.token;

    if (!token) {
      return res.status(401).json({ code: 400, message: "Vui lòng đăng nhập để dùng mã!" });
    }

    let user = null;
    const decoded = jwtHelper.verifyToken(token);
    if (decoded && decoded.id) {
      user = await User.findOne({ _id: decoded.id, deleted: false });
    } else {
      user = await User.findOne({ token: token, deleted: false });
    }

    if (!user) {
      return res.status(401).json({ code: 400, message: "Vui lòng đăng nhập để dùng mã!" });
    }

    const coupon = await Coupon.findOne({
      code: code,
      deleted: false,
      status: "active",
    });

    if (!coupon) return res.status(400).json({ code: 400, message: "Mã không hợp lệ!" });
    if (coupon.quantity <= 0)
      return res.status(400).json({ code: 400, message: "Mã đã hết lượt dùng!" });
    if (new Date() > new Date(coupon.expirationDate))
      return res.status(400).json({ code: 400, message: "Mã đã hết hạn!" });

    // Kiểm tra usedBy an toàn (tránh lỗi includes trên undefined)
    if (coupon.usedBy && coupon.usedBy.includes(user.id)) {
      return res.status(400).json({ code: 400, message: "Bạn đã sử dụng mã này rồi!" });
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
    console.error("applyCoupon error:", error);
    return res.status(500).json({ code: 500, message: "Lỗi hệ thống!" });
  }
};

module.exports.removeCoupon = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    await Cart.updateOne(
      { _id: cartId },
      { $set: { "coupon.code": "", "coupon.discount": 0 } },
    );
    return res.json({ code: 200, message: "Đã xóa mã!" });
  } catch (error) {
    console.error("removeCoupon error:", error);
    return res.status(500).json({ code: 500, message: "Lỗi hệ thống!" });
  }
};

