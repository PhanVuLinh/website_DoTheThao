const moment = require("moment");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");

const variableCongfig = require("../../config/variable");
const paginationHelper = require("../../helpers/pagination.helper");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };
  //lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  //lọc theo ngày tạo
  const dateFilter = {};
  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    dateFilter.$gte = startDate;
  }
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    dateFilter.$lte = endDate;
  }
  if (Object.keys(dateFilter).length > 0) {
    find.createdAt = dateFilter;
  }
  //lọc theo trạng thái thanh toán
  if (req.query.payment_status) {
    find.paymentStatus = req.query.payment_status;
  }
  //lọc theo phương thức thanh toán
  if (req.query.payment_method) {
    find.paymentMethod = req.query.payment_method;
  }
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [
      { orderCode: regexKeyword },
      { fullName: regexKeyword },
      { phone: regexKeyword },
    ];
  }

  //Phân trang
  const countOrder = await Order.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countOrder,
  );
  //hết Phân trang

  const orderList = await Order.find(find)
    .sort({ createdAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

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
    pagination: objectPagination,
  });
};

module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(",").map((id) => id.trim());
    const updatedBy = req.account.id;

    switch (type) {
      case "shipping":
      case "done":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            status: type,
            updatedBy: updatedBy,
            updatedAt: new Date(),
          },
        );
        req.flash("success", `Đã cập nhật ${ids.length} đơn hàng!`);
        break;

      case "cancel":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash("success", `Đã hủy ${ids.length} đơn hàng!`);
        break;

      default:
        req.flash("error", "Hành động không hợp lệ!");
        break;
    }

    return res.redirect(req.get("Referer"));
  } catch (error) {
    console.log(error);
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect(req.get("Referer"));
  }
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
