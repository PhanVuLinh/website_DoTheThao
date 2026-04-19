const moment = require("moment");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");

const variableCongfig = require("../../config/variable");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };
  const orderList = await Order.find(find).sort({ createdAt: "desc" });

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

      order.createdAtTime = moment(order.createdAt).format("HH:mm");
      order.createdAtDate = moment(order.createdAt).format("DD/MM/YYYY");
    }
  }

  res.render("admin/pages/order-list.pug", {
    title: "Danh sách đơn hàng",
    orderList: orderList,
  });
};

module.exports.edit = (req, res) => {
  res.render("admin/pages/order-edit.pug", {
    title: "Chỉnh sửa đơn hàng",
  });
};
