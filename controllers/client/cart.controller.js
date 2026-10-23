const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Coupon = require("../../models/coupon.model");
const User = require("../../models/user.model");
const jwtHelper = require("../../helpers/jwt.helper");
const productsHelper = require("../../helpers/getPriceNew.helper");
const moment = require("moment");

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

    // Lấy danh sách Voucher đang hoạt động để hiển thị trong Modal Ví Voucher
    const rawCoupons = await Coupon.find({
      deleted: false,
      status: "active",
      quantity: { $gt: 0 },
      expirationDate: { $gte: new Date() },
    }).sort({ discountPercentage: -1 });

    const token = req.cookies.tokenUser || req.cookies.token;
    let currentUserId = null;
    if (token) {
      const decoded = jwtHelper.verifyToken(token);
      const resolvedUserId = decoded ? (decoded.userId || decoded.id) : null;
      if (resolvedUserId) {
        currentUserId = resolvedUserId;
      } else {
        const u = await User.findOne({ token: token, deleted: false }).select("_id");
        if (u) currentUserId = u._id.toString();
      }
    }

    const availableCoupons = [];
    for (const c of rawCoupons) {
      const couponObj = c.toObject();
      couponObj.expirationDateFormatted = moment(c.expirationDate).format("DD/MM/YYYY");
      couponObj.isUsed = Boolean(
        currentUserId &&
          Array.isArray(c.usedBy) &&
          c.usedBy.map(String).includes(String(currentUserId)),
      );

      let calcDiscount = Math.round((cart.totalPrice * c.discountPercentage) / 100);
      if (c.maxDiscountAmount && calcDiscount > c.maxDiscountAmount) {
        calcDiscount = c.maxDiscountAmount;
      }
      couponObj.calculatedDiscount = calcDiscount;
      couponObj.isApplied = Boolean(cart.coupon && cart.coupon.code === c.code);
      couponObj.maxDiscountFormatted = c.maxDiscountAmount
        ? c.maxDiscountAmount.toLocaleString("vi-VN")
        : "0";
      availableCoupons.push(couponObj);
    }

    const oldData = req.flash("oldData")[0] || {};
    if (res.locals.user) {
      if (!oldData.fullName && res.locals.user.fullName) oldData.fullName = res.locals.user.fullName;
      if (!oldData.phone && res.locals.user.phone) oldData.phone = res.locals.user.phone;
      if (!oldData.address && res.locals.user.address) oldData.address = res.locals.user.address;
    }

    res.render("client/pages/cart.pug", {
      title: "Giỏ hàng",
      cartDetail: cart,
      availableCoupons: availableCoupons,
      oldData: oldData,
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
      req.flash("error", "Số lượng sản phẩm chọn mua không hợp lệ!");
      return res.redirect(req.get("Referer") || "/");
    }

    const productInfo = await Product.findOne({
      _id: productId,
      deleted: false,
    });

    if (!productInfo) {
      req.flash("error", "Sản phẩm này hiện không còn kinh doanh hoặc đã bị xóa!");
      return res.redirect(req.get("Referer") || "/");
    }

    const hasSizes = Array.isArray(productInfo.sizes) && productInfo.sizes.length > 0;
    let targetStock = 999;
    let finalSize = size;

    if (hasSizes) {
      const sizeItem = productInfo.sizes.find((item) => item.size === size);

      if (!sizeItem) {
        req.flash("error", "Vui lòng chọn kích cỡ (size) phù hợp trước khi thêm vào giỏ hàng!");
        return res.redirect(req.get("Referer") || "/");
      }
      if (sizeItem.stock <= 0) {
        req.flash("error", "Rất tiếc, kích cỡ bạn chọn hiện đang tạm hết hàng!");
        return res.redirect(req.get("Referer") || "/");
      }
      targetStock = sizeItem.stock;
    } else {
      finalSize = "Tiêu chuẩn";
      targetStock = productInfo.stock !== undefined ? productInfo.stock : 999;
      if (targetStock <= 0) {
        req.flash("error", "Rất tiếc, sản phẩm này hiện đang tạm thời hết hàng!");
        return res.redirect(req.get("Referer") || "/");
      }
    }

    const cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      req.flash("error", "Không tìm thấy phiên giỏ hàng, vui lòng tải lại trang!");
      return res.redirect(req.get("Referer") || "/");
    }

    const existProductInCart = cart.products.find(
      (item) => item.product_id === productId && (!hasSizes || item.size === finalSize),
    );

    let newQuantity = quantity;

    if (existProductInCart) {
      newQuantity += existProductInCart.quantity;
    }
    if (newQuantity > targetStock) {
      req.flash("error", `Số lượng đặt vượt quá tồn kho (Hiện chỉ còn ${targetStock} sản phẩm)!`);
      return res.redirect(req.get("Referer") || "/");
    }
    if (existProductInCart) {
      await Cart.updateOne(
        {
          _id: cartId,
          "products.product_id": productId,
          "products.size": existProductInCart.size,
        },
        { $set: { "products.$.quantity": newQuantity } },
      );
    } else {
      const objectCart = {
        product_id: productId,
        quantity: quantity,
        size: finalSize,
      };
      await Cart.updateOne({ _id: cartId }, { $push: { products: objectCart } });
    }

    const isBuyNow =
      req.body.buyNow === "true" ||
      req.body.buyNow === true ||
      req.query.buyNow === "1";

    if (isBuyNow) {
      req.flash("success", "Đã thêm sản phẩm thành công! Vui lòng hoàn tất thông tin nhận hàng.");
      return res.redirect("/cart#checkout-form");
    }

    req.flash("success", "Đã thêm sản phẩm vào giỏ hàng thành công!");
    res.redirect(req.get("Referer") || "/cart");
  } catch (error) {
    console.error("addToCart error:", error);
    req.flash("error", "Không thể thêm sản phẩm vào giỏ hàng, vui lòng thử lại!");
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

    req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng!");
    res.redirect(req.get("Referer") || "/cart");
  } catch (error) {
    console.error("deleteProduct error:", error);
    req.flash("error", "Không thể xóa sản phẩm, vui lòng thử lại sau!");
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

    const hasSizes = Array.isArray(productInfo.sizes) && productInfo.sizes.length > 0;
    let targetStock = 999;

    if (hasSizes) {
      const sizeItem = productInfo.sizes.find((s) => s.size === item.size);
      if (!sizeItem) {
        return res.status(400).json({ success: false, message: "Kích thước không hợp lệ!" });
      }
      targetStock = sizeItem.stock;
    } else {
      targetStock = productInfo.stock !== undefined ? productInfo.stock : 999;
    }

    if (quantity > targetStock) {
      return res.json({
        success: false,
        message: `Chỉ còn ${targetStock} sản phẩm trong kho!`,
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
    if (!code) {
      return res.status(400).json({ code: 400, message: "Vui lòng nhập hoặc chọn mã giảm giá!" });
    }

    const cartId = req.cookies.cartId;
    const token = req.cookies.tokenUser || req.cookies.token;

    if (!token) {
      return res.status(401).json({ code: 400, message: "Vui lòng đăng nhập tài khoản để áp dụng mã giảm giá!" });
    }

    let user = null;
    const decoded = jwtHelper.verifyToken(token);
    const resolvedUserId = decoded ? (decoded.userId || decoded.id) : null;
    if (resolvedUserId) {
      user = await User.findOne({ _id: resolvedUserId, deleted: false });
    } else {
      user = await User.findOne({ token: token, deleted: false });
    }

    if (!user) {
      return res.status(401).json({ code: 400, message: "Vui lòng đăng nhập tài khoản để áp dụng mã giảm giá!" });
    }

    // Tra cứu mã không phân biệt hoa thường
    const coupon = await Coupon.findOne({
      code: new RegExp(`^${code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      deleted: false,
      status: "active",
    });

    if (!coupon) return res.status(400).json({ code: 400, message: "Mã giảm giá không hợp lệ hoặc đã kết thúc!" });
    if (coupon.quantity <= 0)
      return res.status(400).json({ code: 400, message: "Mã ưu đãi này đã hết lượt sử dụng!" });
    if (new Date() > new Date(coupon.expirationDate))
      return res.status(400).json({ code: 400, message: "Mã ưu đãi này đã hết hạn sử dụng!" });

    // Kiểm tra usedBy an toàn (tránh lỗi includes trên undefined)
    if (coupon.usedBy && coupon.usedBy.includes(user.id)) {
      return res.status(400).json({ code: 400, message: "Bạn đã từng sử dụng mã ưu đãi này rồi!" });
    }

    await Cart.updateOne(
      { _id: cartId },
      {
        $set: {
          "coupon.code": coupon.code,
          "coupon.discount": coupon.discountPercentage,
        },
      },
    );

    // Trả về JSON để Frontend nhận diện và reload
    return res.json({ code: 200, message: "Áp dụng mã giảm giá thành công!" });
  } catch (error) {
    console.error("applyCoupon error:", error);
    return res.status(500).json({ code: 500, message: "Có lỗi xảy ra khi áp dụng mã, vui lòng thử lại sau!" });
  }
};

module.exports.removeCoupon = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    await Cart.updateOne(
      { _id: cartId },
      { $set: { "coupon.code": "", "coupon.discount": 0 } },
    );
    return res.json({ code: 200, message: "Đã hủy áp dụng mã giảm giá!" });
  } catch (error) {
    console.error("removeCoupon error:", error);
    return res.status(500).json({ code: 500, message: "Không thể xóa mã ưu đãi, vui lòng thử lại!" });
  }
};

