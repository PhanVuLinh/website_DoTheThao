const moment = require("moment");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const Coupon = require("../../models/coupon.model");

const variableCongfig = require("../../config/variable");
const paginationHelper = require("../../helpers/pagination.helper");
const regexHelper = require("../../helpers/regex.helper");

module.exports.list = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };
    // Lọc theo trạng thái
    if (req.query.status) {
      find.status = req.query.status;
    }
    // Lọc theo ngày tạo
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
    // Lọc theo trạng thái thanh toán
    if (req.query.payment_status) {
      find.paymentStatus = req.query.payment_status;
    }
    // Lọc theo phương thức thanh toán
    if (req.query.payment_method) {
      find.paymentMethod = req.query.payment_method;
    }
    // Tìm kiếm an toàn
    if (req.query.keyword) {
      const keyword = regexHelper.escapeRegex(req.query.keyword.trim());
      const regexKeyword = new RegExp(keyword, "i");
      find.$or = [
        { orderCode: regexKeyword },
        { fullName: regexKeyword },
        { phone: regexKeyword },
      ];
    }

    // Phân trang
    const countOrder = await Order.countDocuments(find);
    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 10,
      },
      req.query,
      countOrder,
    );

    const orderList = await Order.find(find)
      .sort({ createdAt: "desc" })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip)
      .lean();

    // Tối ưu N+1: Thu thập tất cả product_ids để query 1 lần
    const allProductIds = [];
    orderList.forEach((order) => {
      if (order.products && order.products.length > 0) {
        order.products.forEach((p) => {
          if (p.product_id) allProductIds.push(p.product_id);
        });
      }
    });

    const products = await Product.find({
      _id: { $in: allProductIds },
    }).select("title slug thumbnail");

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    for (const order of orderList) {
      if (order.products && order.products.length > 0) {
        for (const item of order.products) {
          const infoProduct = productMap[item.product_id?.toString()];
          if (infoProduct) {
            item.priceNewQuantity = (item.priceNew || 0) * (item.quantity || 1);
            item.title = infoProduct.title;
            item.slug = infoProduct.slug;
            item.thumbnail = infoProduct.thumbnail;
          }
        }
      }

      const pMethod = variableCongfig.paymentMethod.find(
        (item) => item.value === order.paymentMethod,
      );
      order.paymentMethodName = pMethod ? pMethod.label : order.paymentMethod;

      const pStatus = variableCongfig.paymentStatus.find(
        (item) => item.value === order.paymentStatus,
      );
      order.paymentStatusName = pStatus ? pStatus.label : order.paymentStatus;

      const oStatus = variableCongfig.orderStatus.find(
        (item) => item.value === order.status,
      );
      order.statusName = oStatus ? oStatus.label : order.status;

      order.createdAtTime = moment(order.createdAt).format("HH:mm");
      order.createdAtDate = moment(order.createdAt).format("DD/MM/YYYY");
    }

    res.render("admin/pages/order-list.pug", {
      title: "Danh sách đơn hàng",
      orderList: orderList,
      pagination: objectPagination,
    });
  } catch (error) {
    console.error("Order list error:", error);
    req.flash("error", "Lỗi hiển thị danh sách đơn hàng!");
    res.redirect(`/${variableCongfig.pathAdmin}/dashboard`);
  }
};

module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = (req.body.ids || "").split(",").map((id) => id.trim()).filter(Boolean);
    const updatedBy = req.account.id;

    if (!ids.length) {
      req.flash("error", "Không có đơn hàng nào được chọn!");
      return res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/order/list`);
    }

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

      case "cancel": {
        // Tìm các đơn chưa cancel để hoàn lại kho và coupon
        const ordersToCancel = await Order.find({
          _id: { $in: ids },
          status: { $ne: "cancel" },
        });

        for (const order of ordersToCancel) {
          if (order.products && order.products.length > 0) {
            for (const item of order.products) {
              await Product.updateOne(
                { _id: item.product_id, "sizes.size": item.size },
                { $inc: { "sizes.$.stock": item.quantity } },
              );
            }
          }
          if (order.coupon && order.coupon.code) {
            await Coupon.updateOne(
              { code: order.coupon.code },
              {
                $inc: { quantity: 1 },
                $pull: { usedBy: order.user_id },
              },
            );
          }
        }

        await Order.updateMany(
          { _id: { $in: ids } },
          {
            status: "cancel",
            updatedBy: updatedBy,
            updatedAt: new Date(),
          },
        );
        req.flash("success", `Đã hủy ${ids.length} đơn hàng và hoàn trả tồn kho!`);
        break;
      }

      case "delete-all":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash("success", `Đã xóa ${ids.length} đơn hàng vào thùng rác!`);
        break;

      default:
        req.flash("error", "Hành động không hợp lệ!");
        break;
    }

    return res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/order/list`);
  } catch (error) {
    console.error("Order changeMulti error:", error);
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/order/list`);
  }
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const orderDetail = await Order.findOne({
      _id: id,
      deleted: false,
    });

    if (!orderDetail) {
      req.flash("error", "Đơn hàng không tồn tại!");
      return res.redirect(`/${variableCongfig.pathAdmin}/order/list`);
    }

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

    const pMethod = variableCongfig.paymentMethod.find(
      (item) => item.value === orderDetail.paymentMethod,
    );
    orderDetail.paymentMethodName = pMethod ? pMethod.label : orderDetail.paymentMethod;

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
    console.error("Order edit error:", error);
    req.flash("error", "Đơn hàng không tồn tại");
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
      req.flash("error", "Đơn hàng không tồn tại!");
      return res.redirect(`/${variableCongfig.pathAdmin}/order/list`);
    }

    const { status, paymentStatus } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    updateData.updatedBy = req.account.id;
    updateData.updatedAt = new Date();

    // Nếu chuyển trạng thái sang cancel và trước đó chưa cancel -> hoàn trả tồn kho & coupon
    if (status === "cancel" && order.status !== "cancel") {
      if (order.products && order.products.length > 0) {
        for (const item of order.products) {
          await Product.updateOne(
            { _id: item.product_id, "sizes.size": item.size },
            { $inc: { "sizes.$.stock": item.quantity } },
          );
        }
      }
      if (order.coupon && order.coupon.code) {
        await Coupon.updateOne(
          { code: order.coupon.code },
          {
            $inc: { quantity: 1 },
            $pull: { usedBy: order.user_id },
          },
        );
      }
    }

    await Order.updateOne(
      {
        _id: id,
        deleted: false,
      },
      updateData,
    );

    // Bắn thông báo Realtime Socket.io cho khách hàng và Admin
    if (global._io) {
      const statusObj = variableCongfig.orderStatus.find((item) => item.value === status);
      global._io.emit("SERVER_UPDATE_ORDER_STATUS", {
        orderId: id,
        orderCode: order.orderCode,
        status: status,
        statusName: statusObj ? statusObj.label : status,
        paymentStatus: paymentStatus,
      });
    }

    req.flash("success", "Cập nhật trạng thái đơn hàng thành công");
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/order/list`);
  } catch (error) {
    console.error("Order editPatch error:", error);
    req.flash("error", "Có lỗi xảy ra khi cập nhật đơn hàng!");
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
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/order/list`);
  } catch (error) {
    console.error("Order delete error:", error);
    req.flash("error", "Không tồn tại đơn hàng!");
    res.redirect(`/${variableCongfig.pathAdmin}/order/list`);
  }
};

module.exports.trash = async (req, res) => {
  try {
    const find = {
      deleted: true,
    };

    // Tìm kiếm
    if (req.query.keyword) {
      const keyword = regexHelper.escapeRegex(req.query.keyword.trim());
      const regexKeyword = new RegExp(keyword, "i");
      find.$or = [
        { orderCode: regexKeyword },
        { fullName: regexKeyword },
        { phone: regexKeyword },
      ];
    }

    // Phân trang
    const countOrder = await Order.countDocuments(find);
    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 10,
      },
      req.query,
      countOrder,
    );

    const orderList = await Order.find(find)
      .sort({ deletedAt: "desc" })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip)
      .lean();

    // Tối ưu batch query cho trash
    const allProductIds = [];
    const allAccountIds = [];
    orderList.forEach((order) => {
      if (order.products) {
        order.products.forEach((p) => {
          if (p.product_id) allProductIds.push(p.product_id);
        });
      }
      if (order.deletedBy) allAccountIds.push(order.deletedBy);
    });

    const [products, accounts] = await Promise.all([
      Product.find({ _id: { $in: allProductIds } }).select("title thumbnail"),
      Account.find({ _id: { $in: allAccountIds } }).select("fullName"),
    ]);

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const accountMap = {};
    accounts.forEach((a) => {
      accountMap[a._id.toString()] = a;
    });

    for (const order of orderList) {
      if (order.products) {
        for (const item of order.products) {
          const infoProduct = productMap[item.product_id?.toString()];
          if (infoProduct) {
            item.title = infoProduct.title;
            item.thumbnail = infoProduct.thumbnail;
            item.priceNewQuantity = (item.priceNew || 0) * (item.quantity || 1);
          }
        }
      }
      if (order.deletedBy) {
        const infoAccountDeleted = accountMap[order.deletedBy?.toString()];
        order.deletedByFullName = infoAccountDeleted?.fullName;
      }

      const pMethod = variableCongfig.paymentMethod.find(
        (item) => item.value === order.paymentMethod,
      );
      order.paymentMethodName = pMethod?.label || order.paymentMethod;

      const pStatus = variableCongfig.paymentStatus.find(
        (item) => item.value === order.paymentStatus,
      );
      order.paymentStatusName = pStatus?.label || order.paymentStatus;

      const oStatus = variableCongfig.orderStatus.find(
        (item) => item.value === order.status,
      );
      order.statusName = oStatus?.label || order.status;

      order.deletedAtFormat = moment(order.deletedAt).format(
        "HH:mm - DD/MM/YYYY",
      );
    }

    res.render("admin/pages/order-trash.pug", {
      title: "Thùng rác đơn hàng",
      orderList: orderList,
      pagination: objectPagination,
    });
  } catch (error) {
    console.error("Order trash error:", error);
    req.flash("error", "Lỗi tải thùng rác đơn hàng!");
    res.redirect(`/${variableCongfig.pathAdmin}/dashboard`);
  }
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
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/order/trash`);
  } catch (error) {
    console.error("Order restore error:", error);
    req.flash("error", "Không tồn tại đơn hàng!");
    res.redirect(`/${variableCongfig.pathAdmin}/order/trash`);
  }
};

module.exports.deleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Order.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn đơn hàng thành công");
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/order/trash`);
  } catch (error) {
    console.error("Order deleteDestroy error:", error);
    req.flash("error", "Không tồn tại đơn hàng!");
    res.redirect(`/${variableCongfig.pathAdmin}/order/trash`);
  }
};

module.exports.changeMultiTrash = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = (req.body.ids || "").split(",").map((s) => s.trim()).filter(Boolean);

    switch (type) {
      case "restore-all":
        await Order.updateMany(
          { _id: { $in: ids } },
          {
            deleted: false,
          },
        );
        req.flash("success", `Đã khôi phục ${ids.length} đơn hàng!`);
        break;

      case "delete-all":
        await Order.deleteMany({
          _id: { $in: ids },
        });
        req.flash("success", `Đã xóa ${ids.length} vĩnh viễn đơn hàng`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/order/trash`);
  } catch (error) {
    console.error("Order changeMultiTrash error:", error);
    req.flash("error", "Có lỗi xảy ra!");
    res.redirect(req.get("Referer") || `/${variableCongfig.pathAdmin}/order/trash`);
  }
};

