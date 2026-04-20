const moment = require("moment");
const Account = require("../../models/account.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");

const variableCongfig = require("../../config/variable");

module.exports.dashboard = async (req, res) => {
  //section 1
  const section1 = {
    totalAdmin: 0,
    totalUser: 0,
    totalOrder: 0,
    totalPrice: 0,
  };
  section1.totalAdmin = await Account.countDocuments({
    deleted: false,
  });

  const orderQuantity = await Order.find({
    deleted: false,
  });

  section1.totalOrder = orderQuantity.length;

  section1.totalPrice = orderQuantity.reduce((sum, item) => sum + item.total, 0);
  //End section 1

  //Section 3
  const find = {
    deleted: false,
  };
  const orderList = await Order.find(find).sort({ createdAt: "desc" }).limit(5);

  for (const order of orderList) {
    if (order.products && order.products.length > 0) {
      for (const item of order.products) {
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

      order.paymentMethodName = variableCongfig.paymentMethod.find(
        (item) => item.value === order.paymentMethod,
      ).label;
      order.paymentStatusName = variableCongfig.paymentStatus.find(
        (item) => item.value === order.paymentStatus,
      ).label;
      order.statusName = variableCongfig.orderStatus.find(
        (item) => item.value === order.status,
      ).label;

      order.createdAtFormat = moment(order.createdAt).format("HH:mm - DD/MM/YYYY");
    }
  }
  console.log(orderList);
  //End section 3

  res.render("admin/pages/dashboard.pug", {
    title: "Tổng quan",
    section1: section1,
    orderList: orderList,
  });
};
