const moment = require("moment");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const Coupon = require("../../models/coupon.model");
const SettingWebsiteInfo = require("../../models/setting-website-info.model");
const FlashSale = require("../../models/flash-sale.model");

const generateHelper = require("../../helpers/generate.helper");
const variableCongfig = require("../../config/variable");
const sortPayHelper = require("../../helpers/sortPay.helper");
const jwtHelper = require("../../helpers/jwt.helper");
const orderMailHelper = require("../../helpers/orderMail.helper");

// Helper lấy user từ JWT / Cookie an toàn
const getAuthUser = async (req) => {
  const token = req.cookies.tokenUser || req.cookies.token;
  if (!token) return null;

  const decoded = jwtHelper.verifyToken(token);
  if (decoded && decoded.userId) {
    const user = await User.findOne({ _id: decoded.userId, deleted: false, status: "active" });
    if (user) return user;
  }
  // Fallback token cũ
  return await User.findOne({ token: token, deleted: false, status: "active" });
};

module.exports.createPost = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      req.session.returnTo = "/cart";
      req.flash("error", "Vui lòng đăng nhập để đặt hàng!");
      return res.redirect("/auth/login");
    }

    const cartId = req.cookies.cartId;
    const cart = await Cart.findOne({ _id: cartId });

    if (!cart || !cart.products || cart.products.length === 0) {
      req.flash("error", "Giỏ hàng của bạn đang trống!");
      return res.redirect("/cart");
    }

    // 1. Kiểm tra tồn kho trước khi đặt hàng (Tránh Race Condition & âm kho)
    for (const item of cart.products) {
      const productInfo = await Product.findOne({
        _id: item.product_id,
        deleted: false,
        status: "active",
      });

      if (!productInfo) {
        req.flash("error", "Một số sản phẩm trong giỏ không còn tồn tại!");
        return res.redirect("/cart");
      }

      const sizeItem = productInfo.sizes?.find((s) => s.size === item.size);
      if (!sizeItem || sizeItem.stock < item.quantity) {
        req.flash(
          "error",
          `Sản phẩm "${productInfo.title}" (Size ${item.size}) chỉ còn ${sizeItem ? sizeItem.stock : 0} sản phẩm trong kho!`,
        );
        return res.redirect("/cart");
      }
    }

    // 2. Trừ tồn kho nguyên tử (Atomic Update có điều kiện stock >= quantity)
    const deductedItems = [];
    let subtotalValue = 0;
    const products = [];

    for (const item of cart.products) {
      const productInfo = await Product.findOne({
        _id: item.product_id,
        deleted: false,
      }).select("price discountPercentage title");

      const priceNew = productInfo.price * (1 - productInfo.discountPercentage / 100);
      subtotalValue += priceNew * item.quantity;

      // Trừ kho có kiểm tra điều kiện tồn dư
      const updateResult = await Product.updateOne(
        {
          _id: item.product_id,
          sizes: {
            $elemMatch: {
              size: item.size,
              stock: { $gte: item.quantity },
            },
          },
        },
        { $inc: { "sizes.$.stock": -item.quantity } },
      );

      if (updateResult.modifiedCount === 0) {
        // Rollback lại các sản phẩm đã trừ trước đó trong vòng lặp nếu có sản phẩm bị tranh chấp
        for (const prev of deductedItems) {
          await Product.updateOne(
            { _id: prev.product_id, "sizes.size": prev.size },
            { $inc: { "sizes.$.stock": prev.quantity } },
          );
        }
        req.flash("error", `Sản phẩm "${productInfo.title}" vừa hết hàng, vui lòng cập nhật lại giỏ!`);
        return res.redirect("/cart");
      }

      deductedItems.push(item);

      products.push({
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        price: productInfo.price,
        discountPercentage: productInfo.discountPercentage,
        priceNew: priceNew,
      });
    }

    // 3. Xử lý mã giảm giá (Atomic Check & Update)
    let discountValue = 0;
    let couponRecord = null;

    if (cart.coupon && cart.coupon.code) {
      couponRecord = await Coupon.findOne({
        code: cart.coupon.code,
        deleted: false,
        status: "active",
      });

      const isUsed =
        couponRecord &&
        couponRecord.usedBy &&
        couponRecord.usedBy.includes(user.id);

      if (couponRecord && couponRecord.quantity > 0 && !isUsed) {
        let calculatedDiscount = (subtotalValue * couponRecord.discountPercentage) / 100;
        if (calculatedDiscount > couponRecord.maxDiscountAmount) {
          discountValue = couponRecord.maxDiscountAmount;
        } else {
          discountValue = calculatedDiscount;
        }

        // Cập nhật lượt dùng coupon nguyên tử
        const couponUpdate = await Coupon.updateOne(
          {
            _id: couponRecord.id,
            quantity: { $gt: 0 },
            usedBy: { $ne: user.id },
          },
          {
            $inc: { quantity: -1 },
            $push: { usedBy: user.id },
          },
        );

        if (couponUpdate.modifiedCount > 0) {
          req.body.couponCode = couponRecord.code;
        } else {
          discountValue = 0;
        }
      }
    }

    // 4. Tính phí vận chuyển và kiểm tra phương thức thanh toán theo cấu hình Admin
    const websiteInfo = await SettingWebsiteInfo.findOne({});
    const standardShipping = (websiteInfo && websiteInfo.shippingFee !== undefined) ? websiteInfo.shippingFee : 30000;
    const freeThreshold = (websiteInfo && websiteInfo.freeShippingThreshold !== undefined) ? websiteInfo.freeShippingThreshold : 500000;
    const subtotalAfterDiscount = Math.max(0, subtotalValue - discountValue);
    const shippingFee = subtotalAfterDiscount >= freeThreshold ? 0 : standardShipping;

    const paymentMethod = req.body.paymentMethod;
    if (paymentMethod === "cod" && websiteInfo && websiteInfo.paymentCodActive === false) {
      req.flash("error", "Phương thức thanh toán COD hiện đang tạm dừng!");
      return res.redirect("/cart");
    }
    if (paymentMethod === "zaloPay" && websiteInfo && websiteInfo.paymentZaloPayActive === false) {
      req.flash("error", "Phương thức thanh toán ZaloPay hiện đang tạm dừng!");
      return res.redirect("/cart");
    }
    if (paymentMethod === "vnPay" && websiteInfo && websiteInfo.paymentVnPayActive === false) {
      req.flash("error", "Cổng thanh toán VNPay hiện đang tạm dừng!");
      return res.redirect("/cart");
    }
    if (paymentMethod === "bank" && websiteInfo && websiteInfo.paymentBankActive === false) {
      req.flash("error", "Phương thức chuyển khoản ngân hàng hiện đang tạm dừng!");
      return res.redirect("/cart");
    }

    // Lưu đơn hàng
    req.body.user_id = user.id;
    req.body.email = req.body.email || user.email;
    req.body.orderCode = "DH" + generateHelper.generateOrderCode(10);
    req.body.cartId = cartId;
    req.body.products = products;
    req.body.subtotal = subtotalValue;
    req.body.discount = discountValue;
    req.body.shippingFee = shippingFee;
    req.body.total = Math.max(0, subtotalAfterDiscount + shippingFee);
    req.body.paymentStatus = "unpaid";
    req.body.status = "initial";

    const newOrder = new Order(req.body);
    await newOrder.save();

    // Tự động tăng số lượng 'sold' trong chiến dịch Flash Sale đang diễn ra (nếu có sản phẩm trùng khớp)
    try {
      const activeFlashSale = await FlashSale.findOne({
        status: "active",
        deleted: false,
        startTime: { $lte: new Date() },
        endTime: { $gte: new Date() },
      });
      if (activeFlashSale && Array.isArray(activeFlashSale.items)) {
        let hasUpdated = false;
        for (const p of products) {
          const saleItem = activeFlashSale.items.find(
            (item) => item.product_id.toString() === p.product_id.toString()
          );
          if (saleItem) {
            saleItem.sold = (saleItem.sold || 0) + (p.quantity || 1);
            hasUpdated = true;
          }
        }
        if (hasUpdated) {
          await activeFlashSale.save();
        }
      }
    } catch (fsErr) {
      console.error("Lỗi cập nhật flash sale sold:", fsErr);
    }

    // 5. Điều hướng theo phương thức thanh toán
    switch (req.body.paymentMethod) {
      case "cod":
      case "bank":
        await Cart.updateOne(
          { _id: cartId },
          { $set: { products: [], "coupon.code": "", "coupon.discount": 0 } },
        );

        // Bắn thông báo Realtime Socket.io cho Admin
        if (global._io) {
          global._io.emit("SERVER_RETURN_NEW_ORDER", {
            orderId: newOrder.id,
            orderCode: newOrder.orderCode,
            fullName: newOrder.fullName,
            total: newOrder.total,
            createdAt: moment(newOrder.createdAt).format("HH:mm - DD/MM/YYYY"),
            paymentMethod: req.body.paymentMethod,
          });
        }

        // Tự động gửi Email xác nhận hóa đơn (bất đồng bộ)
        orderMailHelper
          .sendOrderConfirmationEmail(newOrder, products)
          .catch((err) => console.error("Gửi email thất bại:", err));

        if (req.body.paymentMethod === "bank") {
          req.flash("success", "Đặt hàng thành công! Quý khách vui lòng chuyển khoản theo thông tin thanh toán.");
        } else {
          req.flash("success", "Đặt hàng thành công!");
        }
        return res.redirect(`/order/success/${newOrder.id}`);

      case "zaloPay":
        return res.redirect(`/order/payment-zalopay/${newOrder.id}`);

      case "vnPay":
        return res.redirect(`/order/payment-vnpay/${newOrder.id}`);

      case "momo":
        req.flash(
          "error",
          "Cổng MoMo hiện đang bảo trì, vui lòng chọn COD, ZaloPay, VNPay hoặc Chuyển khoản ngân hàng!",
        );
        return res.redirect("/cart");

      default:
        req.flash("error", "Phương thức thanh toán không hợp lệ!");
        return res.redirect("/cart");
    }
  } catch (error) {
    console.error("Order Create Error:", error);
    req.flash("error", "Đặt hàng không thành công, vui lòng thử lại!");
    return res.redirect("/cart");
  }
};

module.exports.orderSuccess = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const user = await getAuthUser(req);

    const orderDetail = await Order.findOne({
      _id: orderId,
      deleted: false,
    });

    if (!orderDetail) {
      req.flash("error", "Đơn hàng không tồn tại!");
      return res.redirect("/");
    }

    // Phòng chống IDOR: Chỉ chủ sở hữu đơn hàng (hoặc Admin) mới xem được
    const adminToken = req.cookies.tokenAdmin;
    const isAdmin = adminToken && jwtHelper.verifyToken(adminToken);

    if (!isAdmin && (!user || orderDetail.user_id !== user.id)) {
      req.flash("error", "Bạn không có quyền xem thông tin đơn hàng này!");
      return res.redirect("/");
    }

    const paymentMethodObj = variableCongfig.paymentMethod.find(
      (item) => item.value === orderDetail.paymentMethod,
    );
    orderDetail.paymentMethodName = paymentMethodObj ? paymentMethodObj.label : orderDetail.paymentMethod;

    const paymentStatusObj = variableCongfig.paymentStatus.find(
      (item) => item.value === orderDetail.paymentStatus,
    );
    orderDetail.paymentStatusName = paymentStatusObj ? paymentStatusObj.label : orderDetail.paymentStatus;

    const orderStatusObj = variableCongfig.orderStatus.find(
      (item) => item.value === orderDetail.status,
    );
    orderDetail.statusName = orderStatusObj ? orderStatusObj.label : orderDetail.status;

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("HH:mm - DD/MM/YYYY");

    for (const item of orderDetail.products) {
      const infoProduct = await Product.findOne({
        _id: item.product_id,
        deleted: false,
      });
      if (infoProduct) {
        item.priceNewQuantity = item.priceNew * item.quantity;
        item.title = infoProduct.title;
        item.slug = infoProduct.slug;
        item.thumbnail = infoProduct.thumbnail;
      }
    }

    res.render("client/pages/order-success.pug", {
      title: "Đặt hàng thành công",
      orderDetail: orderDetail,
    });
  } catch (error) {
    console.error("Order Success Error:", error);
    req.flash("error", "Đơn hàng không tồn tại!");
    res.redirect("/");
  }
};

module.exports.paymentZalopay = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const user = await getAuthUser(req);

    const orderDetail = await Order.findOne({
      _id: orderId,
      paymentStatus: "unpaid",
      deleted: false,
    });

    if (!orderDetail) {
      req.flash("error", "Đơn hàng không tồn tại hoặc đã được thanh toán!");
      return res.redirect("/");
    }

    if (user && orderDetail.user_id !== user.id) {
      req.flash("error", "Bạn không có quyền thanh toán đơn hàng này!");
      return res.redirect("/");
    }

    const config = {
      app_id: process.env.ZALOPAY_APPID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: `${process.env.ZALOPAY_DOMAIN}/v2/create`,
    };

    const embed_data = {
      redirecturl: `${process.env.DOMAIN_WEBSITE}/order/payment-zalopay-return/${orderDetail.id}`,
    };

    const items = orderDetail.products.map((item) => ({
      itemid: item.product_id,
      itemname: item.product_id,
      itemprice: item.priceNew,
      itemquantity: item.quantity,
    }));

    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format("YYMMDD")}_${transID}`;

    // Lưu app_trans_id vào order để đối soát khi return
    await Order.updateOne({ _id: orderDetail.id }, { note: app_trans_id });

    const order = {
      app_id: config.app_id,
      app_trans_id: app_trans_id,
      app_user: orderDetail.user_id ? orderDetail.user_id.toString() : "guest",
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: Math.round(Number(orderDetail.total)),
      description: `Thanh toán đơn hàng #${orderDetail.orderCode}`,
      bank_code: "",
      callback_url: `${process.env.DOMAIN_WEBSITE}/order/payment-zalopay-callback`,
    };

    const data = [
      order.app_id,
      order.app_trans_id,
      order.app_user,
      order.amount,
      order.app_time,
      order.embed_data,
      order.item,
    ].join("|");

    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const result = await axios.post(config.endpoint, null, { params: order });

    if (result.data.return_code === 1) {
      return res.redirect(result.data.order_url);
    } else {
      console.error("ZaloPay create error:", result.data);
      req.flash("error", "Lỗi cổng thanh toán ZaloPay, vui lòng thử lại!");
      return res.redirect("/cart");
    }
  } catch (error) {
    console.error("Lỗi khởi tạo ZaloPay:", error);
    req.flash("error", "Không thể kết nối cổng ZaloPay!");
    res.redirect("/cart");
  }
};

// Sửa lỗ hổng Bypass ZaloPay: Bắt buộc xác thực trạng thái qua API ZaloPay
module.exports.paymentZalopayReturn = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderDetail = await Order.findOne({ _id: orderId, deleted: false });

    if (!orderDetail) {
      req.flash("error", "Đơn hàng không tồn tại!");
      return res.redirect("/");
    }

    // Nếu đơn đã được webhook callback cập nhật thành công trước đó
    if (orderDetail.paymentStatus === "paid") {
      return res.redirect(`/order/success/${orderId}`);
    }

    // Xác thực thực tế với ZaloPay Server qua API v2/query
    const app_trans_id = req.query.apptransid || orderDetail.note;
    if (app_trans_id) {
      const postData = {
        app_id: process.env.ZALOPAY_APPID,
        app_trans_id: app_trans_id,
      };
      const data = `${postData.app_id}|${postData.app_trans_id}|${process.env.ZALOPAY_KEY1}`;
      postData.mac = CryptoJS.HmacSHA256(data, process.env.ZALOPAY_KEY1).toString();

      try {
        const checkStatus = await axios.post(
          `${process.env.ZALOPAY_DOMAIN}/v2/query`,
          null,
          { params: postData },
        );

        // Chỉ khi ZaloPay server chính thức xác nhận thành công (return_code = 1)
        if (checkStatus.data && checkStatus.data.return_code === 1) {
          await Order.updateOne(
            { _id: orderId, paymentStatus: "unpaid" },
            { paymentStatus: "paid", status: "initial" },
          );
          await Cart.updateOne(
            { _id: orderDetail.cartId },
            { $set: { products: [], "coupon.code": "", "coupon.discount": 0 } },
          );

          // Bắn Socket.io thông báo đơn thanh toán thành công
          if (global._io) {
            global._io.emit("SERVER_RETURN_NEW_ORDER", {
              orderId: orderDetail.id,
              orderCode: orderDetail.orderCode,
              fullName: orderDetail.fullName,
              total: orderDetail.total,
              createdAt: moment(orderDetail.createdAt).format("HH:mm - DD/MM/YYYY"),
              paymentMethod: "zaloPay",
            });
          }

          // Gửi email hóa đơn
          orderMailHelper
            .sendOrderConfirmationEmail(orderDetail, orderDetail.products)
            .catch((err) => console.error("Email send err:", err));

          return res.redirect(`/order/success/${orderId}`);
        }
      } catch (err) {
        console.error("ZaloPay query API failed:", err.message);
      }
    }

    req.flash("error", "Thanh toán ZaloPay chưa hoàn tất hoặc không hợp lệ!");
    return res.redirect("/cart");
  } catch (error) {
    console.error("Lỗi ZaloPay Return:", error);
    req.flash("error", "Lỗi hệ thống khi kiểm tra thanh toán!");
    res.redirect("/");
  }
};

// ZaloPay Webhook Callback (Server-to-Server)
module.exports.paymentZalopayCallback = async (req, res) => {
  let result = {};
  try {
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    const mac = CryptoJS.HmacSHA256(dataStr, process.env.ZALOPAY_KEY2).toString();

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      const dataJson = JSON.parse(dataStr);
      const orderCode = dataJson["description"]?.split("#")[1];

      if (orderCode) {
        const orderUpdate = await Order.findOneAndUpdate(
          { orderCode: orderCode, paymentStatus: "unpaid" },
          { paymentStatus: "paid", status: "initial" },
        );

        if (orderUpdate) {
          await Cart.updateOne(
            { _id: orderUpdate.cartId },
            { $set: { products: [], "coupon.code": "", "coupon.discount": 0 } },
          );
        }
      }

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    console.error("Lỗi ZaloPay Callback:", ex.message);
    result.return_code = 0;
    result.return_message = ex.message;
  }
  res.json(result);
};

module.exports.paymentVnpay = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const user = await getAuthUser(req);

    const orderDetail = await Order.findOne({
      _id: orderId,
      paymentStatus: "unpaid",
      deleted: false,
    });

    if (!orderDetail) {
      req.flash("error", "Đơn hàng không tồn tại hoặc đã được thanh toán!");
      return res.redirect("/");
    }

    if (user && orderDetail.user_id !== user.id) {
      req.flash("error", "Bạn không có quyền thanh toán đơn hàng này!");
      return res.redirect("/");
    }

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    let tmnCode = process.env.VNPAY_CODE;
    let secretKey = process.env.VNPAY_SECRET;
    let vnpUrl = process.env.VNPAY_URL;
    let returnUrl = `${process.env.DOMAIN_WEBSITE}/order/payment-vnpay-result`;
    let orderIdVNP = `${orderId}-${Date.now()}`;
    let amount = orderDetail.total;

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderIdVNP;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderIdVNP;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    vnp_Params = sortPayHelper.sortObject(vnp_Params);

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    return res.redirect(vnpUrl);
  } catch (error) {
    console.error("Lỗi tạo link VNPay:", error);
    req.flash("error", "Lỗi hệ thống khi khởi tạo thanh toán VNPay!");
    res.redirect("/cart");
  }
};

// Sửa lỗi Crash View "success" không tồn tại trong VNPay Result
module.exports.paymentVnpayResult = async (req, res) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortPayHelper.sortObject(vnp_Params);

    let secretKey = process.env.VNPAY_SECRET;
    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const [orderId] = (vnp_Params["vnp_TxnRef"] || "").split("-");
      const orderDetail = await Order.findOne({ _id: orderId, deleted: false });

      if (!orderDetail) {
        req.flash("error", "Đơn hàng không tồn tại!");
        return res.redirect("/");
      }

      if (
        vnp_Params["vnp_ResponseCode"] === "00" &&
        vnp_Params["vnp_TransactionStatus"] === "00"
      ) {
        await Order.updateOne(
          { _id: orderId, deleted: false },
          { paymentStatus: "paid", status: "initial" },
        );
        await Cart.updateOne(
          { _id: orderDetail.cartId },
          { $set: { products: [], "coupon.code": "", "coupon.discount": 0 } },
        );

        // Bắn Socket.io thông báo đơn thanh toán thành công
        if (global._io) {
          global._io.emit("SERVER_RETURN_NEW_ORDER", {
            orderId: orderDetail.id,
            orderCode: orderDetail.orderCode,
            fullName: orderDetail.fullName,
            total: orderDetail.total,
            createdAt: moment(orderDetail.createdAt).format("HH:mm - DD/MM/YYYY"),
            paymentMethod: "vnPay",
          });
        }

        // Gửi email hóa đơn
        orderMailHelper
          .sendOrderConfirmationEmail(orderDetail, orderDetail.products)
          .catch((err) => console.error("Email send err:", err));

        return res.redirect(`/order/success/${orderId}`);
      }

      req.flash(
        "error",
        `Giao dịch VNPay không thành công hoặc bị hủy (Mã phản hồi: ${vnp_Params["vnp_ResponseCode"]})!`,
      );
      return res.redirect("/cart");
    } else {
      req.flash("error", "Chữ ký bảo mật giao dịch VNPay không hợp lệ!");
      return res.redirect("/cart");
    }
  } catch (error) {
    console.error("VNPay Result Error:", error);
    req.flash("error", "Lỗi hệ thống khi kiểm tra kết quả thanh toán VNPay!");
    res.redirect("/cart");
  }
};
