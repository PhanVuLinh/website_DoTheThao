const moment = require("moment");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");

const generateHelper = require("../../helpers/generate.helper");
const variableCongfig = require("../../config/variable");

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
    //giảm giá
    req.body.discount = 0;
    ///thanh toán
    req.body.total = req.body.subtotal - req.body.discount;
    //trạng thái thanh toán
    req.body.paymentStatus = "unpaid";
    //trạng thái đơn hàng
    req.body.status = "initial";

    const newRecord = new Order(req.body);
    await newRecord.save();

    switch (req.body.paymentMethod) {
      case "cod":
        await Cart.updateOne({ _id: cartId }, { products: [] });
        req.flash("success", "Đặt hàng thành công");
        res.redirect(`/order/success/${newRecord.id}`);
        break;
      case "zaloPay":
        res.redirect(`/order/payment-zalopay/${newRecord.id}`);
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
      redirecturl: `${process.env.DOMAIN_WEBSITE}/order/success/${orderDetail.id}`,
    };
    const items = [];
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
      app_user: `${orderDetail.phone}-${orderDetail.id}`,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: orderDetail.total,
      description: `Thanh toán đơn hàng: ${orderDetail.orderCode}`,
      bank_code: "",
      callback_url: `${process.env.DOMAIN_WEBSITE}/order/payment-zalopay-result/${orderDetail.id}`,
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

    const result = await axios.post(config.endpoint, null, {
      params: order,
    });
    if (result.data.return_code == 1) {
      return res.redirect(result.data.order_url);
    } else {
      req.flash("error", "Lỗi cổng thanh toán ZaloPay. Vui lòng thử lại!");
      return res.redirect("/cart");
    }
  } catch (error) {
    req.flash("error", "Lỗi hệ thống khi khởi tạo thanh toán ZaloPay!");
    res.redirect("/");
  }
};

module.exports.paymentZalopayResult = async (req, res) => {
  let result = {};

  try {
    const orderId = req.params.orderId;

    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    const config = {
      key2: process.env.ZALOPAY_KEY2,
    };

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "MAC không hợp lệ (Invalid MAC)";
      console.log("Cảnh báo: Có request giả mạo ZaloPay Callback!");
    } else {
      console.log(`[ZaloPay] Đã nhận tiền cho đơn hàng ID: ${orderId}`);

      await Order.updateOne(
        { _id: orderId, deleted: false },
        {
          paymentStatus: "paid",
          status: "initial",
        },
      );

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    console.log("Lỗi Callback ZaloPay:", ex.message);
    result.return_code = 0;
    result.return_message = ex.message;
  }

  // Bắt buộc phải trả về JSON cho ZaloPay
  res.json(result);
};
