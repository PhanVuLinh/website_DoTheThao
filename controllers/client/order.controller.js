const moment = require("moment");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const Coupon = require("../../models/coupon.model");

const generateHelper = require("../../helpers/generate.helper");
const variableCongfig = require("../../config/variable");
const sortPayHelper = require("../../helpers/sortPay.helper");

module.exports.createPost = async (req, res) => {
  try {
    if (!req.cookies.token) {
      req.session.returnTo = "/cart";
      req.flash("error", "Vui lòng đăng nhập để đặt hàng!");
      return res.redirect("/user/login");
    }
    const user = await User.findOne({
      token: req.cookies.token,
      deleted: false,
    });
    if (!user) {
      req.flash("error", "Tài khoản không tồn tại!");
      return res.redirect("/user/login");
    }
    req.body.user_id = user.id;

    req.body.orderCode = "DH" + generateHelper.generateOrderCode(10);
    const cartId = req.cookies.cartId;
    const cart = await Cart.findOne({
      _id: cartId,
    });
    req.body.cartId = cartId;

    const products = [];
    let subtotalValue = 0;

    for (const product of cart.products) {
      const productInfo = await Product.findOne({
        _id: product.product_id,
        deleted: false,
      }).select("price discountPercentage");

      if (productInfo) {
        const priceNew =
          productInfo.price * (1 - productInfo.discountPercentage / 100);
        subtotalValue += priceNew * product.quantity;
        const objectProduct = {
          product_id: product.product_id,
          quantity: product.quantity,
          size: product.size,
          price: productInfo.price,
          discountPercentage: productInfo.discountPercentage,
          priceNew: priceNew,
        };
        products.push(objectProduct);

        //cập nhật tồn kho
        await Product.updateOne(
          {
            _id: product.product_id,
            "sizes.size": product.size,
          },
          { $inc: { "sizes.$.stock": -product.quantity } },
        );
      }
    }
    req.body.products = products;
    //tạm tính
    req.body.subtotal = subtotalValue;
    
    let discountValue = 0;
    let couponRecord = null;

    if (cart.coupon && cart.coupon.code) {
      couponRecord  = await Coupon.findOne({
        code: cart.coupon.code,
        deleted: false,
        status: "active",
      });

      // Kiểm tra xem khách đã dùng chưa (Bảo vệ an toàn)
      const isUsed =
        couponRecord &&
        couponRecord.usedBy &&
        couponRecord.usedBy.includes(user.id);

      // Nếu mã hợp lệ VÀ chưa dùng
      if (couponRecord && couponRecord.quantity > 0 && !isUsed) {
        let calculatedDiscount = (subtotalValue * couponRecord.discountPercentage) / 100;
        
        // 2. So sánh: Chỉ khi nào vượt quá mức tối đa thì mới lấy Max
        if (calculatedDiscount > couponRecord.maxDiscountAmount) {
          discountValue = couponRecord.maxDiscountAmount;
        } else {
          discountValue = calculatedDiscount; // Còn không thì cứ lấy đúng số tiền %
        }

        // 3. Đẩy tên mã vào req.body để Mongoose lưu xuống Database
        req.body.couponCode = couponRecord.code;
      } else {
        discountValue = 0;
      }
    }
    //đã thanh toán đc chỉ còn xử lý lưu code, discount, total và coupee tài khoảng đã dùng 
    
    req.body.discount = discountValue;
    req.body.total = req.body.subtotal - req.body.discount;
    if (req.body.total < 0) req.body.total = 0;
    //trạng thái thanh toán
    req.body.paymentStatus = "unpaid";
    //trạng thái đơn hàng
    req.body.status = "initial";

    const newRecord = new Order(req.body);
    await newRecord.save();

    if (couponRecord && discountValue > 0) {
      await Coupon.updateOne(
        { _id: couponRecord.id },
        {
          $inc: { quantity: -1 },
          $push: { usedBy: user.id },
        },
      );
    }

    switch (req.body.paymentMethod) {
      case "cod":
        await Cart.updateOne(
          { _id: cartId },
          { $set: { products: [], "coupon.code": "", "coupon.discount": 0 } },
        );
        req.flash("success", "Đặt hàng thành công");
        res.redirect(`/order/success/${newRecord.id}`);
        break;
      case "zaloPay":
        res.redirect(`/order/payment-zalopay/${newRecord.id}`);
        break;
      case "vnPay":
        res.redirect(`/order/payment-vnpay/${newRecord.id}`);
        break;
      case "momo":
        res.redirect(`/order/payment-momo/${newRecord.id}`);
        break;
      default:
        res.redirect("/cart");
        break;
    }
  } catch (error) {
    req.flash("error", "Đặt hàng không thành công");
    res.redirect("/");
  }
};

module.exports.orderSuccess = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderDetail = await Order.findOne({
      _id: orderId,
      deleted: false,
    });
    if (!orderDetail) return res.redirect("/");

    orderDetail.paymentMethodName = variableCongfig.paymentMethod.find(
      (item) => item.value === orderDetail.paymentMethod,
    ).label;

    orderDetail.paymentStatusName = variableCongfig.paymentStatus.find(
      (item) => item.value === orderDetail.paymentStatus,
    ).label;

    orderDetail.statusName = variableCongfig.orderStatus.find(
      (item) => item.value === orderDetail.status,
    ).label;

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format(
      "HH:mm - DD/MM/YYYY",
    );

    for (const item of orderDetail.products) {
      const infoProduct = await Product.findOne({
        _id: item.product_id,
        deleted: false,
      });
      if (infoProduct) {
        const priceNewQuantity = item.priceNew * item.quantity;
        item.priceNewQuantity = priceNewQuantity;
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
    req.flash("error", "Không tồn tài");
    res.redirect("/");
  }
};

module.exports.paymentZalopay = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderDetail = await Order.findOne({
      _id: orderId,
      paymentStatus: "unpaid",
      deleted: false,
    });

    if (!orderDetail) {
      req.flash("error", "Đơn hàng không tồn tại hoặc đã được thanh toán!");
      return res.redirect("/");
    }

    const config = {
      app_id: process.env.ZALOPAY_APPID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: `${process.env.ZALOPAY_DOMAIN}/v2/create`,
    };

    const embed_data = {
      // Sau khi user thanh toán xong ZaloPay redirect về đây (GET)
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

    const order = {
      app_id: config.app_id,
      app_trans_id: app_trans_id,
      app_user: orderDetail.user_id.toString(),
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: Math.round(Number(orderDetail.total)),
      description: `Thanh toán đơn hàng #${orderDetail.orderCode}`,
      bank_code: "",
      // ZaloPay server gọi đây để xác nhận (POST)
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

    if (result.data.return_code == 1) {
      return res.redirect(result.data.order_url);
    } else {
      console.log("ZaloPay error:", result.data);
      req.flash("error", "Lỗi cổng thanh toán ZaloPay.");
      return res.redirect("/cart");
    }
  } catch (error) {
    console.error("Lỗi khởi tạo ZaloPay:", error);
    res.redirect("/");
  }
};

module.exports.paymentZalopayReturn = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const status = req.query.status;

    console.log(`[ZaloPay Return] orderId: ${orderId}, status: ${status}`);

    if (status == "1") {
      const orderDetail = await Order.findOne({ _id: orderId, deleted: false });

      if (!orderDetail) {
        req.flash("error", "Đơn hàng không tồn tại!");
        return res.redirect("/");
      }

      if (orderDetail.paymentStatus !== "paid") {
        await Order.updateOne(
          { _id: orderId, deleted: false },
          { paymentStatus: "paid", status: "initial" },
        );
        await Cart.updateOne(
          { _id: orderDetail.cartId },
          { $set: { products: [], "coupon.code": "", "coupon.discount": 0 } },
        );
      }

      return res.redirect(`/order/success/${orderId}`);
    }

    req.flash("error", "Thanh toán ZaloPay thất bại hoặc bị hủy!");
    return res.redirect("/cart");
  } catch (error) {
    console.log("Lỗi ZaloPay Return:", error);
    req.flash("error", "Lỗi hệ thống!");
    res.redirect("/");
  }
};

module.exports.paymentZalopayCallback = async (req, res) => {
  let result = {};
  try {
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    const mac = CryptoJS.HmacSHA256(
      dataStr,
      process.env.ZALOPAY_KEY2,
    ).toString();

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      const dataJson = JSON.parse(dataStr);
      const orderCode = dataJson["description"].split("#")[1];

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

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    console.log("Lỗi ZaloPay Callback:", ex.message);
    result.return_code = 0;
    result.return_message = ex.message;
  }
  res.json(result);
};

module.exports.paymentVnpay = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderDetail = await Order.findOne({
      _id: orderId,
      paymentStatus: "unpaid",
      deleted: false,
    });

    if (!orderDetail) {
      req.flash("error", "Đơn hàng không tồn tại hoặc đã được thanh toán!");
      return res.redirect("/");
    }

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let tmnCode = process.env.VNPAY_CODE;
    let secretKey = process.env.VNPAY_SECRET;
    let vnpUrl = process.env.VNPAY_URL;
    let returnUrl = `${process.env.DOMAIN_WEBSITE}/order/payment-vnpay-result`;
    let orderIdVNP = `${orderId}-${Date.now()}`;
    let amount = orderDetail.total;
    let bankCode = "";

    let locale = "vn";
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderIdVNP;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderIdVNP;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortPayHelper.sortObject(vnp_Params);

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    console.log("RETURN URL:", returnUrl);
    res.redirect(vnpUrl);
  } catch (error) {
    console.log("Lỗi tạo link VNPay:", error);
    req.flash("error", "Lỗi hệ thống khi khởi tạo thanh toán VNPay!");
    res.redirect("/");
  }
};

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
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      if (
        vnp_Params["vnp_ResponseCode"] === "00" &&
        vnp_Params["vnp_TransactionStatus"] === "00"
      ) {
        const [orderId, date] = vnp_Params["vnp_TxnRef"].split("-");
        const orderDetail = await Order.findOne({
          _id: orderId,
          deleted: false,
        });

        await Order.updateOne(
          { _id: orderId, deleted: false },
          { paymentStatus: "paid" },
        );
        await Cart.updateOne(
          { _id: orderDetail.cartId },
          { $set: { products: [], "coupon.code": "", "coupon.discount": 0 } },
        );
        return res.redirect(`/order/success/${orderId}`);
      }

      res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
    } else {
      res.render("success", { code: "97" });
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Lỗi hệ thống khi thanh toán VNPay!");
    res.redirect("/");
  }
};
