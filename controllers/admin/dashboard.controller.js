const moment = require("moment");
const Account = require("../../models/account.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");

const variableConfig = require("../../config/variable");
// Hàm lấy doanh thu theo từng ngày trong tháng (ĐÃ ĐƯỢC NÂNG CẤP)
async function getRevenueByMonth(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const orders = await Order.find({
    deleted: false,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // Khởi tạo mảng 0 cho từng ngày
  const dailyRevenue = Array(daysInMonth).fill(0);

  for (const order of orders) {
    // FIX 1: Dùng moment để đưa về đúng múi giờ Việt Nam (tránh bị lệch ngày khi đẩy lên Host)
    const day = moment(order.createdAt).utcOffset("+07:00").date();

    // FIX 2: Đề phòng Database của bạn quên lưu trường tổng tiền (total)
    let orderTotal = order.total;
    if (!orderTotal && order.products && order.products.length > 0) {
      orderTotal = order.products.reduce(
        (sum, item) => sum + item.priceNew * item.quantity,
        0,
      );
    }

    dailyRevenue[day - 1] += orderTotal || 0;
  }

  return dailyRevenue;
}

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

  section1.totalUser = await User.countDocuments({
    deleted: false,
  });

  section1.totalOrder = orderQuantity.length;

  section1.totalPrice = orderQuantity.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  //End section 1
  // Section 2 - Biểu đồ doanh thu
  const now = new Date();
  const chartMonth = parseInt(req.query.chartMonth) || now.getMonth() + 1;
  const chartYear = parseInt(req.query.chartYear) || now.getFullYear();

  const prevMonth = chartMonth === 1 ? 12 : chartMonth - 1;
  const prevYear = chartMonth === 1 ? chartYear - 1 : chartYear;

  const currentMonthRevenue = await getRevenueByMonth(chartYear, chartMonth);
  const prevMonthRevenue = await getRevenueByMonth(prevYear, prevMonth);

  const monthOptions = [];
  for (let i = 0; i < 6; i++) {
    let m = now.getMonth() + 1 - i;
    let y = now.getFullYear();
    if (m <= 0) {
      m += 12;
      y -= 1;
    }
    monthOptions.push({
      month: m,
      year: y,
      label: `${String(m).padStart(2, "0")}/${y}`,
    });
  }

  //Section 3
  const find = {
    deleted: false,
  };
  const orderList = await Order.find(find).sort({ createdAt: "desc" }).limit(5);

  for (const order of orderList) {
    order.id = (order._id || "").toString();
    order.total = order.total || 0;

    if (order.products && order.products.length > 0) {
      for (const item of order.products) {
        const infoProduct = await Product.findOne({
          _id: item.product_id,
          deleted: false,
        });
        if (infoProduct) {
          const priceNewQuantity = (item.priceNew || 0) * (item.quantity || 1);
          item.priceNewQuantity = priceNewQuantity;
          item.title = infoProduct.title;
          item.slug = infoProduct.slug;
          item.thumbnail = infoProduct.thumbnail;
        }
      }

      const pMethod = variableConfig.paymentMethod.find(
        (item) => item.value === order.paymentMethod,
      );
      order.paymentMethodName = pMethod ? pMethod.label : order.paymentMethod;

      const pStatus = variableConfig.paymentStatus.find(
        (item) => item.value === order.paymentStatus,
      );
      order.paymentStatusName = pStatus ? pStatus.label : order.paymentStatus;

      const oStatus = variableConfig.orderStatus.find(
        (item) => item.value === order.status,
      );
      order.statusName = oStatus ? oStatus.label : order.status;

      order.createdAtFormat = moment(order.createdAt).format(
        "HH:mm - DD/MM/YYYY",
      );
    }
  }
  //End section 3

  // Section 4 - Cảnh báo tồn kho thấp
  const lowStockProductsRaw = await Product.find({
    deleted: false,
    status: "active",
    "sizes.stock": { $lte: 5 },
  }).select("title slug thumbnail price priceNew sizes").lean();

  const lowStockProducts = [];
  for (const prod of lowStockProductsRaw) {
    const criticalSizes = (prod.sizes || []).filter((s) => s.stock <= 5);
    if (criticalSizes.length > 0) {
      const totalStock = (prod.sizes || []).reduce((sum, s) => sum + (s.stock || 0), 0);
      lowStockProducts.push({
        _id: prod._id.toString(),
        title: prod.title,
        slug: prod.slug,
        thumbnail: prod.thumbnail,
        criticalSizes: criticalSizes,
        totalStock: totalStock,
      });
    }
  }
  lowStockProducts.sort((a, b) => a.totalStock - b.totalStock);
  const lowStockDisplay = lowStockProducts.slice(0, 8);

  // Section 5 - Top Sản Phẩm Bán Chạy Nhất & Phân tích chuyên sâu
  const validOrders = await Order.find({
    deleted: false,
    status: { $ne: "cancel" },
  }).lean();

  const productSalesMap = {};
  let totalValidRevenue = 0;
  let totalItemsSold = 0;

  for (const ord of validOrders) {
    const ordTotal = ord.total || 0;
    totalValidRevenue += ordTotal;

    if (Array.isArray(ord.products)) {
      for (const p of ord.products) {
        if (!p.product_id) continue;
        const pId = p.product_id.toString();
        const qty = parseInt(p.quantity, 10) || 1;
        const price = p.priceNew || p.price || 0;
        const revenue = price * qty;

        totalItemsSold += qty;

        if (!productSalesMap[pId]) {
          productSalesMap[pId] = {
            productId: pId,
            soldQuantity: 0,
            totalRevenue: 0,
          };
        }
        productSalesMap[pId].soldQuantity += qty;
        productSalesMap[pId].totalRevenue += revenue;
      }
    }
  }

  const salesArray = Object.values(productSalesMap);
  salesArray.sort((a, b) => b.soldQuantity - a.soldQuantity);

  const topSellingProducts = [];
  const topSlice = salesArray.slice(0, 5);

  for (let i = 0; i < topSlice.length; i++) {
    const item = topSlice[i];
    const prodInfo = await Product.findOne({
      _id: item.productId,
      deleted: false,
    })
      .select("title slug thumbnail brand price priceNew")
      .lean();

    if (prodInfo) {
      const percentage =
        totalItemsSold > 0
          ? Math.round((item.soldQuantity / totalItemsSold) * 100)
          : 0;
      topSellingProducts.push({
        rank: i + 1,
        title: prodInfo.title,
        slug: prodInfo.slug,
        thumbnail: prodInfo.thumbnail,
        brand: prodInfo.brand || "TitiSport",
        price: prodInfo.priceNew || prodInfo.price,
        soldQuantity: item.soldQuantity,
        totalRevenue: item.totalRevenue,
        percentage: percentage,
      });
    }
  }

  // Thống kê phân bổ đơn hàng theo trạng thái & Chỉ số vận hành
  const allOrders = await Order.find({ deleted: false }).lean();
  const orderStatusCounts = {
    initial: 0,
    shipping: 0,
    done: 0,
    cancel: 0,
  };

  allOrders.forEach((o) => {
    if (orderStatusCounts[o.status] !== undefined) {
      orderStatusCounts[o.status]++;
    }
  });

  const totalAllOrders = allOrders.length;
  const successRate =
    totalAllOrders > 0
      ? Math.round((orderStatusCounts.done / totalAllOrders) * 100)
      : 100;

  const averageOrderValue =
    validOrders.length > 0
      ? Math.round(totalValidRevenue / validOrders.length)
      : 0;

  res.render("admin/pages/dashboard.pug", {
    title: "Tổng quan",
    section1: section1,
    orderList: orderList,
    lowStockList: lowStockDisplay,
    lowStockCount: lowStockProducts.length,
    topSellingProducts: topSellingProducts,
    orderStatusCounts: orderStatusCounts,
    totalAllOrders: totalAllOrders,
    successRate: successRate,
    averageOrderValue: averageOrderValue,
    totalItemsSold: totalItemsSold,
    totalValidRevenue: totalValidRevenue,
    chart: {
      currentMonth: chartMonth,
      currentYear: chartYear,
      prevMonth,
      prevYear,
      currentMonthRevenue: JSON.stringify(currentMonthRevenue),
      prevMonthRevenue: JSON.stringify(prevMonthRevenue),
    },
    monthOptions,
  });
};

// [GET] /admin/dashboard/export-revenue
module.exports.exportRevenue = async (req, res) => {
  try {
    const chartMonth = parseInt(req.query.chartMonth, 10);
    const chartYear =
      parseInt(req.query.chartYear, 10) || new Date().getFullYear();

    const find = {
      deleted: false,
    };

    let timeTitle = "Toàn bộ thời gian";
    if (chartMonth && !isNaN(chartMonth)) {
      const startDate = new Date(chartYear, chartMonth - 1, 1);
      const endDate = new Date(chartYear, chartMonth, 0, 23, 59, 59, 999);
      find.createdAt = { $gte: startDate, $lte: endDate };
      timeTitle = `Tháng ${chartMonth}/${chartYear}`;
    }

    const orders = await Order.find(find).sort({ createdAt: -1 }).lean();

    // Chuẩn bị CSV với UTF-8 BOM (\uFEFF) mở trên Excel tiếng Việt không lỗi font
    let csv = "\uFEFF";
    csv += `BÁO CÁO DOANH THU BÁN HÀNG TITISPORT STORE - ${timeTitle.toUpperCase()}\n`;
    csv += `Thời gian xuất báo cáo: ${moment().format("HH:mm - DD/MM/YYYY")}\n`;
    csv += `Tổng số lượng đơn: ${orders.length} đơn\n\n`;

    csv +=
      "STT,Mã Đơn Hàng,Họ Tên Khách Hàng,Số Điện Thoại,Địa Chỉ Nhận Hàng,Thời Gian Đặt,Phương Thức Thanh Toán,Trạng Thái Đơn,Tạm Tính (VNĐ),Giảm Giá (VNĐ),Mã Ưu Đãi,Tổng Thanh Toán (VNĐ)\n";

    let totalSubtotal = 0;
    let totalDiscount = 0;
    let grandTotal = 0;

    orders.forEach((ord, index) => {
      const subtotal = ord.subtotal || ord.total || 0;
      const discount = ord.discount || 0;
      const total = ord.total || 0;

      if (ord.status !== "cancel") {
        totalSubtotal += subtotal;
        totalDiscount += discount;
        grandTotal += total;
      }

      const pMethod = variableConfig.paymentMethod.find(
        (m) => m.value === ord.paymentMethod,
      );
      const pMethodName = pMethod
        ? pMethod.label
        : ord.paymentMethod || "Tiền mặt (COD)";

      const oStatus = variableConfig.orderStatus.find(
        (s) => s.value === ord.status,
      );
      const oStatusName = oStatus ? oStatus.label : ord.status || "Chờ xử lý";

      const escapeCsv = (str) => {
        if (!str) return '""';
        return `"${String(str).replace(/"/g, '""').replace(/\n/g, " ")}"`;
      };

      const dateStr = moment(ord.createdAt).format("DD/MM/YYYY HH:mm");

      csv +=
        [
          index + 1,
          escapeCsv(ord.orderCode || ord._id),
          escapeCsv(ord.fullName),
          escapeCsv(ord.phone),
          escapeCsv(ord.address),
          escapeCsv(dateStr),
          escapeCsv(pMethodName),
          escapeCsv(oStatusName),
          subtotal,
          discount,
          escapeCsv(ord.couponCode || "Không"),
          total,
        ].join(",") + "\n";
    });

    csv += "\n";
    csv += `,,,,,,,"TỔNG DOANH THU THỰC NHẬN:",${totalSubtotal},${totalDiscount},,${grandTotal}\n`;
    csv += `,,,,,,,"(Chỉ tính các đơn hợp lệ - không bao gồm đơn hủy)",,,,\n`;

    const fileName = `Bao-cao-doanh-thu-TitiSport-${
      chartMonth ? `T${chartMonth}-${chartYear}` : "Tat-ca"
    }.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("Export revenue error:", error);
    req.flash("error", "Lỗi xuất báo cáo doanh thu!");
    res.redirect(`/${res.locals.pathAdmin}/dashboard`);
  }
};
