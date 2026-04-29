const moment = require("moment");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");

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

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const orderDetail = await Order.findOne({
      _id: id,
      deleted: false,
    });

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

    orderDetail.paymentMethodName = variableCongfig.paymentMethod.find(
      (item) => item.value === orderDetail.paymentMethod,
    ).label;

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format(
      "HH:mm - DD/MM/YYYY",
    );

    res.render("admin/pages/order-edit.pug", {
      title: `Đơn hàng ${orderDetail.orderCode}`,
      orderDetail: orderDetail,
      paymentStatus: variableCongfig.paymentStatus,
      orderStatus: variableCongfig.orderStatus,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/order/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({
      _id: id,
      deleted: false,
    });
    if (!order) {
      return res.redirect(`/${variableCongfig.pathAdmin}/order/list`);
    }
    await Order.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );
    req.flash("success", "Cập nhật trạng thái đơn hàng thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/order/list`);
  }
};

module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Order.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );
    req.flash("success", "Xóa đơn hàng thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/order/list`);
  }
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };

  const orderList = await Order.find(find).sort({
    deletedAt: "desc",
  });

  for (const order of orderList) {
    for (const item of order.products) {
      const infoProduct = await Product.findOne({
        _id: item.product_id,
        deleted: false,
      });

      if (infoProduct) {
        item.title = infoProduct.title;
        item.thumbnail = infoProduct.thumbnail;

        item.priceNewQuantity = item.priceNew * item.quantity;
      }
    }
    if (order.deletedBy) {
      const infoAccountDeleted = await Account.findOne({
        _id: order.deletedBy,
      });
      order.deletedByFullName = infoAccountDeleted?.fullName;
    }

    order.paymentMethodName = variableCongfig.paymentMethod.find(
      (item) => item.value === order.paymentMethod,
    )?.label;
    order.paymentStatusName = variableCongfig.paymentStatus.find(
      (item) => item.value === order.paymentStatus,
    )?.label;
    order.statusName = variableCongfig.orderStatus.find(
      (item) => item.value === order.status,
    )?.label;

    order.deletedAtFormat = moment(order.deletedAt).format(
      "HH:mm - DD/MM/YYYY",
    );
  }

  res.render("admin/pages/order-trash.pug", {
    title: "Thùng rác đơn hàng",
    orderList,
  });
};

module.exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    await Order.updateOne(
      { _id: id },
      {
        deleted: false,
      },
    );
    req.flash("success", "Khôi phục đơn hàng thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.deleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Order.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn đơn hàng thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};
