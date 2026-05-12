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

      order.paymentMethodName = variableConfig.paymentMethod.find(
        (item) => item.value === order.paymentMethod,
      ).label;
      order.paymentStatusName = variableConfig.paymentStatus.find(
        (item) => item.value === order.paymentStatus,
      ).label;
      order.statusName = variableConfig.orderStatus.find(
        (item) => item.value === order.status,
      ).label;

      order.createdAtFormat = moment(order.createdAt).format(
        "HH:mm - DD/MM/YYYY",
      );
    }
  }
  //End section 3

  res.render("admin/pages/dashboard.pug", {
    title: "Tổng quan",
    section1: section1,
    orderList: orderList,
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
