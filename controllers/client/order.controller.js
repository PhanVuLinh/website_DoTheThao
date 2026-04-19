const moment = require("moment");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");

const generateHelper = require("../../helpers/generate.helper");
const variableCongfig = require("../../config/variable");

module.exports.createPost = async (req, res) => {
  try {
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

    await Cart.updateOne({ _id: cartId }, { products: [] });

    req.flash("success", "Đặt hàng thành công");
    res.redirect(`/order/success/${newRecord.id}`);
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
