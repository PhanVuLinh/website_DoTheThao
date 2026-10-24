const moment = require("moment");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const User = require("../../models/user.model");
const variableConfig = require("../../config/variable");
const excelHelper = require("../../helpers/excel.helper");

// Helper: Phân tích khoảng thời gian từ query
function resolveDateRange(query) {
  const timeRange = query.timeRange || "30days";
  let startDate;
  let endDate = moment().utcOffset("+07:00").endOf("day").toDate();
  let label = "30 ngày gần nhất";

  switch (timeRange) {
    case "today":
      startDate = moment().utcOffset("+07:00").startOf("day").toDate();
      label = "Hôm nay (" + moment().format("DD/MM/YYYY") + ")";
      break;
    case "7days":
      startDate = moment().utcOffset("+07:00").subtract(6, "days").startOf("day").toDate();
      label = "7 ngày gần nhất";
      break;
    case "30days":
      startDate = moment().utcOffset("+07:00").subtract(29, "days").startOf("day").toDate();
      label = "30 ngày gần nhất";
      break;
    case "thisMonth":
      startDate = moment().utcOffset("+07:00").startOf("month").toDate();
      label = "Tháng này (Tháng " + (moment().month() + 1) + "/" + moment().year() + ")";
      break;
    case "lastMonth":
      startDate = moment().utcOffset("+07:00").subtract(1, "month").startOf("month").toDate();
      endDate = moment().utcOffset("+07:00").subtract(1, "month").endOf("month").toDate();
      label = "Tháng trước (Tháng " + (moment().month()) + "/" + moment().year() + ")";
      break;
    case "thisYear":
      startDate = moment().utcOffset("+07:00").startOf("year").toDate();
      label = "Năm nay (" + moment().year() + ")";
      break;
    case "custom":
      if (query.startDate) {
        startDate = moment(query.startDate, "YYYY-MM-DD").utcOffset("+07:00").startOf("day").toDate();
      } else {
        startDate = moment().utcOffset("+07:00").subtract(29, "days").startOf("day").toDate();
      }
      if (query.endDate) {
        endDate = moment(query.endDate, "YYYY-MM-DD").utcOffset("+07:00").endOf("day").toDate();
      }
      label = `Từ ${moment(startDate).format("DD/MM/YYYY")} đến ${moment(endDate).format("DD/MM/YYYY")}`;
      break;
    default:
      startDate = moment().utcOffset("+07:00").subtract(29, "days").startOf("day").toDate();
      label = "30 ngày gần nhất";
      break;
  }

  return { timeRange, startDate, endDate, label };
}

// [GET] /admin/statistic
module.exports.index = async (req, res) => {
  try {
    const { timeRange, startDate, endDate, label: timeRangeLabel } = resolveDateRange(req.query);

    // 1. Lấy tất cả đơn hàng trong kỳ
    const orders = await Order.find({
      deleted: false,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: 1 }).lean();

    // 2. Tính toán kỳ trước để so sánh tăng trưởng
    const durationDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const prevStartDate = moment(startDate).subtract(durationDays, "days").toDate();
    const prevEndDate = moment(startDate).subtract(1, "second").toDate();

    const prevOrders = await Order.find({
      deleted: false,
      createdAt: { $gte: prevStartDate, $lte: prevEndDate },
    }).lean();

    // 3. Tính toán các chỉ số tài chính và vận hành
    let grossRevenue = 0;
    let totalDiscount = 0;
    let totalSubtotal = 0;
    let totalItemsSold = 0;

    const orderStatusCounts = {
      initial: 0,
      shipping: 0,
      done: 0,
      cancel: 0,
    };

    const paymentMethodMap = {
      cod: { count: 0, revenue: 0, label: "Thanh toán khi nhận hàng (COD)" },
      vnPay: { count: 0, revenue: 0, label: "Ví điện tử VNPAY" },
      bank: { count: 0, revenue: 0, label: "Chuyển khoản ngân hàng" },
      other: { count: 0, revenue: 0, label: "Khác" },
    };

    const productSalesMap = {};
    const customerSalesMap = {};

    for (const ord of orders) {
      if (orderStatusCounts[ord.status] !== undefined) {
        orderStatusCounts[ord.status]++;
      }

      const ordTotal = ord.total || 0;
      const ordDiscount = ord.discount || 0;
      const ordSubtotal = ord.subtotal || ordTotal;

      if (ord.status !== "cancel") {
        grossRevenue += ordTotal;
        totalDiscount += ordDiscount;
        totalSubtotal += ordSubtotal;

        const pmKey = ord.paymentMethod || "cod";
        if (!paymentMethodMap[pmKey]) {
          paymentMethodMap[pmKey] = { count: 0, revenue: 0, label: pmKey };
        }
        paymentMethodMap[pmKey].count++;
        paymentMethodMap[pmKey].revenue += ordTotal;

        if (Array.isArray(ord.products)) {
          for (const p of ord.products) {
            if (!p.product_id) continue;
            const pId = p.product_id.toString();
            const qty = parseInt(p.quantity, 10) || 1;
            const pPrice = p.priceNew || p.price || 0;
            const rev = pPrice * qty;

            totalItemsSold += qty;

            if (!productSalesMap[pId]) {
              productSalesMap[pId] = {
                productId: pId,
                title: p.title || "Sản phẩm",
                thumbnail: p.thumbnail || "",
                size: p.size || "",
                soldQuantity: 0,
                totalRevenue: 0,
              };
            }
            productSalesMap[pId].soldQuantity += qty;
            productSalesMap[pId].totalRevenue += rev;
          }
        }

        const custKey = ord.phone || ord.user_id || ord.fullName;
        if (custKey) {
          if (!customerSalesMap[custKey]) {
            customerSalesMap[custKey] = {
              customerKey: custKey,
              fullName: ord.fullName || "Khách vãng lai",
              phone: ord.phone || "---",
              email: ord.email || "---",
              address: ord.address || "---",
              orderCount: 0,
              totalSpent: 0,
              lastOrderDate: ord.createdAt,
            };
          }
          customerSalesMap[custKey].orderCount++;
          customerSalesMap[custKey].totalSpent += ordTotal;
          if (new Date(ord.createdAt) > new Date(customerSalesMap[custKey].lastOrderDate)) {
            customerSalesMap[custKey].lastOrderDate = ord.createdAt;
          }
        }
      }
    }

    let prevGrossRevenue = 0;
    for (const ord of prevOrders) {
      if (ord.status !== "cancel") {
        prevGrossRevenue += ord.total || 0;
      }
    }

    const revenueGrowth = prevGrossRevenue > 0
      ? Math.round(((grossRevenue - prevGrossRevenue) / prevGrossRevenue) * 100)
      : (grossRevenue > 0 ? 100 : 0);

    const validOrderCount = orders.length - orderStatusCounts.cancel;
    const aov = validOrderCount > 0 ? Math.round(grossRevenue / validOrderCount) : 0;
    const completionRate = orders.length > 0
      ? Math.round((orderStatusCounts.done / orders.length) * 100)
      : 100;

    // 4. Biểu đồ đường Timeline theo ngày
    const dateMap = {};
    const curr = moment(startDate).clone();
    const endMoment = moment(endDate).clone();

    while (curr.isSameOrBefore(endMoment, "day")) {
      const key = curr.format("DD/MM");
      dateMap[key] = { revenue: 0, orders: 0 };
      curr.add(1, "days");
    }

    for (const ord of orders) {
      const key = moment(ord.createdAt).utcOffset("+07:00").format("DD/MM");
      if (dateMap[key]) {
        dateMap[key].orders++;
        if (ord.status !== "cancel") {
          dateMap[key].revenue += ord.total || 0;
        }
      }
    }

    const timelineLabels = Object.keys(dateMap);
    const timelineRevenue = timelineLabels.map((k) => dateMap[k].revenue);
    const timelineOrders = timelineLabels.map((k) => dateMap[k].orders);

    // 5. Phân bổ doanh thu theo Danh Mục
    const categoryMap = {};
    const productIds = Object.keys(productSalesMap);
    if (productIds.length > 0) {
      const productDocs = await Product.find({ _id: { $in: productIds } })
        .select("_id title category_id thumbnail price priceNew brand slug")
        .lean();

      const categoryIds = [...new Set(productDocs.map((p) => p.category_id).filter(Boolean))];
      const categoryDocs = await Category.find({ _id: { $in: categoryIds } })
        .select("_id title")
        .lean();

      const catNameMap = {};
      categoryDocs.forEach((c) => {
        catNameMap[c._id.toString()] = c.title;
      });

      productDocs.forEach((prod) => {
        const pId = prod._id.toString();
        const sales = productSalesMap[pId];
        if (sales) {
          sales.title = prod.title;
          sales.thumbnail = prod.thumbnail || sales.thumbnail;
          sales.slug = prod.slug;
          sales.brand = prod.brand || "TitiSport";
          sales.price = prod.priceNew || prod.price;

          const catName = (prod.category_id && catNameMap[prod.category_id.toString()]) || "Chưa phân loại";
          sales.categoryName = catName;

          if (!categoryMap[catName]) {
            categoryMap[catName] = { name: catName, revenue: 0, quantity: 0 };
          }
          categoryMap[catName].revenue += sales.totalRevenue;
          categoryMap[catName].quantity += sales.soldQuantity;
        }
      });
    }

    const categoryList = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);
    const categoryLabels = categoryList.map((c) => c.name);
    const categoryRevenue = categoryList.map((c) => c.revenue);

    // 6. Top 10 sản phẩm bán chạy nhất
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.soldQuantity - a.soldQuantity)
      .slice(0, 10);

    topProducts.forEach((p, idx) => {
      p.rank = idx + 1;
      p.percentage = totalItemsSold > 0 ? Math.round((p.soldQuantity / totalItemsSold) * 100) : 0;
    });

    // 7. Top 10 Khách hàng VIP
    const topCustomers = Object.values(customerSalesMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    topCustomers.forEach((c, idx) => {
      c.rank = idx + 1;
      c.lastOrderFormatted = moment(c.lastOrderDate).format("DD/MM/YYYY");
      const nameParts = (c.fullName || "").trim().split(/\s+/);
      c.initials = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : (nameParts[0] ? nameParts[0].slice(0, 2).toUpperCase() : "VIP");
    });

    // 8. Tồn kho cảnh báo
    const lowStockProducts = await Product.find({
      deleted: false,
      status: "active",
      "sizes.stock": { $lte: 5 },
    }).select("title slug thumbnail price sizes").lean();

    const lowStockSummary = {
      outOfStockCount: 0,
      lowStockCount: lowStockProducts.length,
    };

    lowStockProducts.forEach((p) => {
      const allZero = (p.sizes || []).every((s) => s.stock <= 0);
      if (allZero) lowStockSummary.outOfStockCount++;
    });

    // 9. Tính toán các chỉ số vận hành mở rộng (Executive Operational Health)
    const cancelRate = orders.length > 0 ? Math.round((orderStatusCounts.cancel / orders.length) * 100) : 0;
    const avgOrdersPerDay = Math.round((orders.length / durationDays) * 10) / 10;
    const avgRevenuePerDay = durationDays > 0 ? Math.round(grossRevenue / durationDays) : 0;

    let peakRevenueDay = { date: "Chưa có", revenue: 0, orders: 0 };
    for (const [dateKey, val] of Object.entries(dateMap)) {
      if (val.revenue > peakRevenueDay.revenue) {
        peakRevenueDay = { date: dateKey, revenue: val.revenue, orders: val.orders };
      }
    }

    const topCategory = categoryList.length > 0 ? categoryList[0] : null;

    // Render trang
    res.render("admin/pages/statistic.pug", {
      title: "Trung Tâm Báo Cáo & Thống Kê",
      activeMenu: "statistic",
      filter: {
        timeRange,
        startDate: moment(startDate).format("YYYY-MM-DD"),
        endDate: moment(endDate).format("YYYY-MM-DD"),
        label: timeRangeLabel,
        durationDays,
        nowFormatted: moment().utcOffset("+07:00").format("HH:mm - DD/MM/YYYY"),
      },
      kpi: {
        grossRevenue,
        prevGrossRevenue,
        revenueGrowth,
        totalOrders: orders.length,
        validOrderCount,
        aov,
        totalDiscount,
        totalSubtotal,
        totalItemsSold,
        completionRate,
        cancelRate,
        avgOrdersPerDay,
        avgRevenuePerDay,
        peakRevenueDay,
        topCategory,
      },
      orderStatusCounts,
      paymentMethodMap,
      charts: {
        timelineLabels: JSON.stringify(timelineLabels),
        timelineRevenue: JSON.stringify(timelineRevenue),
        timelineOrders: JSON.stringify(timelineOrders),
        categoryLabels: JSON.stringify(categoryLabels),
        categoryRevenue: JSON.stringify(categoryRevenue),
        paymentLabels: JSON.stringify(Object.values(paymentMethodMap).map((m) => m.label)),
        paymentRevenue: JSON.stringify(Object.values(paymentMethodMap).map((m) => m.revenue)),
      },
      categoryList,
      topProducts,
      topCustomers,
      lowStockSummary,
    });
  } catch (error) {
    console.error("Statistic Controller Error:", error);
    req.flash("error", "Lỗi tải dữ liệu báo cáo thống kê: " + error.message);
    res.redirect(`/${res.locals.pathAdmin}/dashboard`);
  }
};

// [GET] /admin/statistic/export
module.exports.exportReport = async (req, res) => {
  try {
    const { startDate, endDate, label: timeRangeLabel } = resolveDateRange(req.query);
    const exportType = req.query.type || "all";
    const exportFormat = req.query.format || "xlsx";
    const adminAccount = req.account;
    const adminName = adminAccount ? adminAccount.fullName : "Quản trị viên";

    const orders = await Order.find({
      deleted: false,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 }).lean();

    // 1. Phân tích dữ liệu sản phẩm
    const prodMap = {};
    for (const ord of orders) {
      if (ord.status === "cancel") continue;
      if (Array.isArray(ord.products)) {
        for (const p of ord.products) {
          if (!p.product_id) continue;
          const pId = p.product_id.toString();
          const qty = parseInt(p.quantity, 10) || 1;
          const price = p.priceNew || p.price || 0;
          if (!prodMap[pId]) {
            prodMap[pId] = {
              id: pId,
              title: p.title || "Sản phẩm",
              brand: "TitiSport",
              price: price,
              qty: 0,
              revenue: 0,
            };
          }
          prodMap[pId].qty += qty;
          prodMap[pId].revenue += price * qty;
        }
      }
    }
    const productList = Object.values(prodMap).sort((a, b) => b.qty - a.qty);
    const totalProdQty = productList.reduce((sum, p) => sum + p.qty, 0);
    const totalProdRevenue = productList.reduce((sum, p) => sum + p.revenue, 0);

    // 2. Phân tích dữ liệu khách hàng VIP
    const custMap = {};
    for (const ord of orders) {
      if (ord.status === "cancel") continue;
      const key = ord.phone || ord.user_id || ord.fullName;
      if (!key) continue;
      if (!custMap[key]) {
        custMap[key] = {
          fullName: ord.fullName || "Khách hàng",
          phone: ord.phone || "",
          email: ord.email || "",
          address: ord.address || "",
          orderCount: 0,
          totalSpent: 0,
        };
      }
      custMap[key].orderCount++;
      custMap[key].totalSpent += ord.total || 0;
    }
    const customerList = Object.values(custMap).sort((a, b) => b.totalSpent - a.totalSpent);
    const totalCustOrders = customerList.reduce((sum, c) => sum + c.orderCount, 0);
    const totalCustSpent = customerList.reduce((sum, c) => sum + c.totalSpent, 0);

    // 3. Phân tích tổng doanh thu đơn hàng
    let totalSubtotal = 0;
    let totalDiscount = 0;
    let grandTotal = 0;
    orders.forEach((ord) => {
      if (ord.status !== "cancel") {
        totalSubtotal += ord.subtotal || ord.total || 0;
        totalDiscount += ord.discount || 0;
        grandTotal += ord.total || 0;
      }
    });

    // ========================================================
    // TRƯỜNG HỢP A: XUẤT FILE CSV (Nếu người dùng chọn format=csv)
    // ========================================================
    if (exportFormat === "csv") {
      let csv = "\uFEFF"; // UTF-8 BOM chống lỗi font tiếng Việt trên Excel
      const escapeCsv = (str) => `"${String(str || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;

      if (exportType === "products") {
        csv += `BÁO CÁO TOP SẢN PHẨM BÁN CHẠY - TITISPORT STORE\n`;
        csv += `Khoảng thời gian: ${timeRangeLabel}\n`;
        csv += `Thời gian xuất: ${moment().format("HH:mm - DD/MM/YYYY")}\n`;
        csv += `Người xuất: ${adminName}\n\n`;
        csv += "STT,Mã SP,Tên Sản Phẩm,Thương Hiệu,Số Lượng Bán,Đơn Giá Hiện Tại (VNĐ),Tổng Doanh Thu (VNĐ),Tỷ Trọng (%)\n";

        productList.forEach((p, idx) => {
          const share = totalProdRevenue > 0 ? ((p.revenue / totalProdRevenue) * 100).toFixed(2) + "%" : "0%";
          csv += [idx + 1, escapeCsv(p.id), escapeCsv(p.title), escapeCsv(p.brand), p.qty, p.price, p.revenue, share].join(",") + "\n";
        });
        csv += `\nTỔNG CỘNG,,,${totalProdQty},,${totalProdRevenue},100%\n`;

        const fileName = `Bao-cao-san-pham-ban-chay-${moment().format("YYYYMMDD-HHmm")}.csv`;
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        return res.status(200).send(csv);
      } else if (exportType === "customers") {
        csv += `BÁO CÁO KHÁCH HÀNG THÂN THIẾT (VIP) - TITISPORT STORE\n`;
        csv += `Khoảng thời gian: ${timeRangeLabel}\n`;
        csv += `Thời gian xuất: ${moment().format("HH:mm - DD/MM/YYYY")}\n`;
        csv += `Người xuất: ${adminName}\n\n`;
        csv += "STT,Họ Tên Khách Hàng,Số Điện Thoại,Email,Địa Chỉ Nhận Hàng,Số Lượng Đơn Đã Đặt,Tổng Tiền Chi Tiêu (VNĐ),Hạng VIP\n";

        customerList.forEach((c, idx) => {
          let tier = "Thành viên";
          if (c.totalSpent >= 10000000) tier = "VIP Kim Cương";
          else if (c.totalSpent >= 5000000) tier = "VIP Vàng";
          else if (c.totalSpent >= 2000000) tier = "VIP Bạc";

          csv += [idx + 1, escapeCsv(c.fullName), escapeCsv(c.phone), escapeCsv(c.email), escapeCsv(c.address), c.orderCount, c.totalSpent, escapeCsv(tier)].join(",") + "\n";
        });
        csv += `\nTỔNG CỘNG,,,,${totalCustOrders},${totalCustSpent},\n`;

        const fileName = `Bao-cao-khach-hang-vip-${moment().format("YYYYMMDD-HHmm")}.csv`;
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        return res.status(200).send(csv);
      } else {
        csv += `BÁO CÁO THỐNG KÊ DOANH THU & ĐƠN HÀNG - TITISPORT STORE\n`;
        csv += `Khoảng thời gian: ${timeRangeLabel}\n`;
        csv += `Thời gian xuất: ${moment().format("HH:mm - DD/MM/YYYY")}\n`;
        csv += `Người xuất: ${adminName}\n`;
        csv += `Tổng số đơn: ${orders.length} đơn\n\n`;
        csv += "STT,Mã Đơn Hàng,Khách Hàng,Số Điện Thoại,Thời Gian Đặt,Phương Thức TT,Trạng Thái Đơn,Tạm Tính (VNĐ),Giảm Giá (VNĐ),Tổng Thanh Toán (VNĐ)\n";

        orders.forEach((ord, idx) => {
          const statusObj = variableConfig.orderStatus.find((s) => s.value === ord.status);
          const statusLabel = statusObj ? statusObj.label : ord.status;
          const pMethodObj = variableConfig.paymentMethod.find((m) => m.value === ord.paymentMethod);
          const pMethodLabel = pMethodObj ? pMethodObj.label : ord.paymentMethod;

          csv += [
            idx + 1,
            escapeCsv(ord.orderCode || ord._id),
            escapeCsv(ord.fullName),
            escapeCsv(ord.phone),
            escapeCsv(moment(ord.createdAt).format("DD/MM/YYYY HH:mm")),
            escapeCsv(pMethodLabel),
            escapeCsv(statusLabel),
            ord.subtotal || ord.total || 0,
            ord.discount || 0,
            ord.total || 0,
          ].join(",") + "\n";
        });

        csv += `\n,,,,,,,TỔNG DOANH THU THỰC NHẬN:,,${grandTotal}\n`;
        csv += `,,,,,,,(Chỉ tính các đơn hàng hợp lệ - không tính đơn đã hủy),,\n`;

        const fileName = `Bao-cao-doanh-thu-${moment().format("YYYYMMDD-HHmm")}.csv`;
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        return res.status(200).send(csv);
      }
    }

    // ========================================================
    // TRƯỜNG HỢP B: XUẤT FILE EXCEL CHUẨN (.XLSX) - MẶC ĐỊNH
    // Tự động căn lề, chống rớt chữ, mã hóa Unicode 100%, có màu sắc
    // ========================================================
    const workbook = excelHelper.createWorkbook();

    // ----------------------------------------------------
    // TAB 1: TỔNG QUAN DOANH THU & ĐƠN HÀNG
    // ----------------------------------------------------
    if (exportType === "all" || exportType === "overview") {
      const wsOverview = workbook.addWorksheet("Doanh thu & Đơn hàng", {
        views: [{ showGridLines: true }],
        properties: { tabColor: { argb: "1E3A8A" } },
      });

      excelHelper.addHeaderBanner(wsOverview, {
        title: "BÁO CÁO DOANH THU & ĐƠN HÀNG CHI TIẾT",
        subtitle: "TITISPORT STORE - HỆ THỐNG QUẢN TRỊ THƯƠNG MẠI ĐIỆN TỬ",
        meta: [
          { label: "Kỳ báo cáo", value: timeRangeLabel },
          { label: "Thời gian xuất", value: moment().format("HH:mm - DD/MM/YYYY") },
          { label: "Người xuất báo cáo", value: adminName },
          { label: "Tổng số lượng đơn", value: `${orders.length} đơn hàng` },
        ],
      });

      const overviewColumns = [
        { header: "STT", align: "center", minWidth: 8 },
        { header: "Mã Đơn Hàng", align: "center", minWidth: 16 },
        { header: "Thời Gian Đặt", align: "center", minWidth: 18 },
        { header: "Khách Hàng", align: "left", minWidth: 22 },
        { header: "Số Điện Thoại", align: "center", minWidth: 15 },
        { header: "Địa Chỉ Nhận Hàng", align: "left", wrapText: true, minWidth: 35, maxWidth: 45 },
        { header: "Phương Thức TT", align: "center", minWidth: 18 },
        { header: "Trạng Thái Đơn", align: "center", minWidth: 18 },
        { header: "Tạm Tính (VNĐ)", align: "right", numFmt: '#,##0 "đ"', minWidth: 16 },
        { header: "Giảm Giá (VNĐ)", align: "right", numFmt: '#,##0 "đ"', minWidth: 14 },
        { header: "Tổng Thanh Toán (VNĐ)", align: "right", numFmt: '#,##0 "đ"', minWidth: 18 },
      ];

      // Dòng Header bắt đầu từ dòng 7 (sau banner)
      const headerRow = wsOverview.addRow(overviewColumns.map((c) => c.header));
      const headerRowIndex = headerRow.number;
      const dataStartRowIndex = headerRowIndex + 1;

      orders.forEach((ord, idx) => {
        const statusObj = variableConfig.orderStatus.find((s) => s.value === ord.status);
        const statusLabel = statusObj ? statusObj.label : ord.status;
        const pMethodObj = variableConfig.paymentMethod.find((m) => m.value === ord.paymentMethod);
        const pMethodLabel = pMethodObj ? pMethodObj.label : ord.paymentMethod;

        wsOverview.addRow([
          idx + 1,
          ord.orderCode || ord._id.toString(),
          moment(ord.createdAt).format("DD/MM/YYYY HH:mm"),
          ord.fullName || "Khách vãng lai",
          ord.phone || "---",
          ord.address || "---",
          pMethodLabel,
          statusLabel,
          ord.subtotal || ord.total || 0,
          ord.discount || 0,
          ord.total || 0,
        ]);
      });

      const dataEndRowIndex = wsOverview.lastRow ? wsOverview.lastRow.number : headerRowIndex;

      // Thêm dòng tổng kết
      if (orders.length > 0) {
        const totalRow = wsOverview.addRow([
          "TỔNG CỘNG DOANH THU THỰC NHẬN (ĐƠN HỢP LỆ):",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          totalSubtotal,
          totalDiscount,
          grandTotal,
        ]);
        wsOverview.mergeCells(`A${totalRow.number}:H${totalRow.number}`);
        totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "right" };
      }

      excelHelper.formatTable(wsOverview, {
        headerRowIndex,
        dataStartRowIndex,
        dataEndRowIndex,
        columns: overviewColumns,
        hasTotalRow: orders.length > 0,
      });
    }

    // ----------------------------------------------------
    // TAB 2: TOP SẢN PHẨM BÁN CHẠY
    // ----------------------------------------------------
    if (exportType === "all" || exportType === "products") {
      const wsProducts = workbook.addWorksheet("Top Sản phẩm", {
        views: [{ showGridLines: true }],
        properties: { tabColor: { argb: "D97706" } },
      });

      excelHelper.addHeaderBanner(wsProducts, {
        title: "BÁO CÁO TOP SẢN PHẨM BÁN CHẠY NHẤT",
        subtitle: "TITISPORT STORE - THỐNG KÊ SẢN LƯỢNG & DOANH THU THEO MẶT HÀNG",
        meta: [
          { label: "Kỳ báo cáo", value: timeRangeLabel },
          { label: "Thời gian xuất", value: moment().format("HH:mm - DD/MM/YYYY") },
          { label: "Người xuất báo cáo", value: adminName },
          { label: "Tổng số mặt hàng đã tiêu thụ", value: `${productList.length} sản phẩm` },
        ],
      });

      const productColumns = [
        { header: "Hạng", align: "center", minWidth: 8 },
        { header: "Mã Sản Phẩm", align: "center", minWidth: 24 },
        { header: "Tên Sản Phẩm", align: "left", wrapText: true, minWidth: 38, maxWidth: 50 },
        { header: "Thương Hiệu", align: "center", minWidth: 15 },
        { header: "Số Lượng Đã Bán", align: "right", numFmt: '#,##0', minWidth: 18 },
        { header: "Đơn Giá Hiện Tại (VNĐ)", align: "right", numFmt: '#,##0 "đ"', minWidth: 20 },
        { header: "Tổng Doanh Thu (VNĐ)", align: "right", numFmt: '#,##0 "đ"', minWidth: 22 },
        { header: "Tỷ Trọng (%)", align: "right", numFmt: '0.00%', minWidth: 16 },
      ];

      const headerRow = wsProducts.addRow(productColumns.map((c) => c.header));
      const headerRowIndex = headerRow.number;
      const dataStartRowIndex = headerRowIndex + 1;

      productList.forEach((p, idx) => {
        const share = totalProdRevenue > 0 ? p.revenue / totalProdRevenue : 0;
        wsProducts.addRow([
          idx + 1,
          p.id,
          p.title,
          p.brand,
          p.qty,
          p.price,
          p.revenue,
          share,
        ]);
      });

      const dataEndRowIndex = wsProducts.lastRow ? wsProducts.lastRow.number : headerRowIndex;

      if (productList.length > 0) {
        const totalRow = wsProducts.addRow([
          "TỔNG CỘNG TOÀN BỘ SẢN PHẨM:",
          "",
          "",
          "",
          totalProdQty,
          "",
          totalProdRevenue,
          totalProdRevenue > 0 ? 1 : 0,
        ]);
        wsProducts.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
        totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "right" };
      }

      excelHelper.formatTable(wsProducts, {
        headerRowIndex,
        dataStartRowIndex,
        dataEndRowIndex,
        columns: productColumns,
        hasTotalRow: productList.length > 0,
      });
    }

    // ----------------------------------------------------
    // TAB 3: KHÁCH HÀNG THÂN THIẾT VIP
    // ----------------------------------------------------
    if (exportType === "all" || exportType === "customers") {
      const wsCustomers = workbook.addWorksheet("Khách hàng VIP", {
        views: [{ showGridLines: true }],
        properties: { tabColor: { argb: "059669" } },
      });

      excelHelper.addHeaderBanner(wsCustomers, {
        title: "BÁO CÁO KHÁCH HÀNG THÂN THIẾT (VIP)",
        subtitle: "TITISPORT STORE - BẢNG XẾP HẠNG CHI TIÊU KHÁCH HÀNG",
        meta: [
          { label: "Kỳ báo cáo", value: timeRangeLabel },
          { label: "Thời gian xuất", value: moment().format("HH:mm - DD/MM/YYYY") },
          { label: "Người xuất báo cáo", value: adminName },
          { label: "Tổng số khách hàng thân thiết", value: `${customerList.length} khách hàng` },
        ],
      });

      const customerColumns = [
        { header: "Hạng", align: "center", minWidth: 8 },
        { header: "Họ Và Tên Khách Hàng", align: "left", minWidth: 24 },
        { header: "Số Điện Thoại", align: "center", minWidth: 16 },
        { header: "Email", align: "left", minWidth: 26 },
        { header: "Địa Chỉ Nhận Hàng", align: "left", wrapText: true, minWidth: 38, maxWidth: 50 },
        { header: "Số Đơn Đã Đặt", align: "right", numFmt: '#,##0', minWidth: 16 },
        { header: "Tổng Chi Tiêu (VNĐ)", align: "right", numFmt: '#,##0 "đ"', minWidth: 22 },
        { header: "Phân Hạng VIP", align: "center", minWidth: 20 },
      ];

      const headerRow = wsCustomers.addRow(customerColumns.map((c) => c.header));
      const headerRowIndex = headerRow.number;
      const dataStartRowIndex = headerRowIndex + 1;

      customerList.forEach((c, idx) => {
        let tier = "Thành viên 🌟";
        if (c.totalSpent >= 10000000) tier = "VIP Kim Cương 💎";
        else if (c.totalSpent >= 5000000) tier = "VIP Vàng 🥇";
        else if (c.totalSpent >= 2000000) tier = "VIP Bạc 🥈";

        wsCustomers.addRow([
          idx + 1,
          c.fullName,
          c.phone || "---",
          c.email || "---",
          c.address || "---",
          c.orderCount,
          c.totalSpent,
          tier,
        ]);
      });

      const dataEndRowIndex = wsCustomers.lastRow ? wsCustomers.lastRow.number : headerRowIndex;

      if (customerList.length > 0) {
        const totalRow = wsCustomers.addRow([
          "TỔNG CỘNG CHI TIÊU CỦA KHÁCH HÀNG:",
          "",
          "",
          "",
          "",
          totalCustOrders,
          totalCustSpent,
          "",
        ]);
        wsCustomers.mergeCells(`A${totalRow.number}:E${totalRow.number}`);
        totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "right" };
      }

      excelHelper.formatTable(wsCustomers, {
        headerRowIndex,
        dataStartRowIndex,
        dataEndRowIndex,
        columns: customerColumns,
        hasTotalRow: customerList.length > 0,
      });
    }

    const typeSuffix =
      exportType === "products"
        ? "Top-san-pham"
        : exportType === "customers"
        ? "Khach-hang-VIP"
        : exportType === "overview"
        ? "Doanh-thu"
        : "Tong-hop";

    const fileName = `Bao-cao-${typeSuffix}-TitiSport-${moment().format("YYYYMMDD-HHmm")}.xlsx`;
    await excelHelper.sendWorkbook(res, workbook, fileName);
  } catch (error) {
    console.error("Export Error:", error);
    req.flash("error", "Lỗi xuất báo cáo: " + error.message);
    res.redirect(`/${res.locals.pathAdmin}/statistic`);
  }
};

// [GET] /admin/statistic/print
module.exports.printView = async (req, res) => {
  try {
    const { startDate, endDate, label: timeRangeLabel } = resolveDateRange(req.query);

    const orders = await Order.find({
      deleted: false,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 }).lean();

    let grossRevenue = 0;
    let totalDiscount = 0;
    let completedCount = 0;
    let shippingCount = 0;
    let cancelCount = 0;

    orders.forEach((ord) => {
      if (ord.status === "done") completedCount++;
      else if (ord.status === "shipping") shippingCount++;
      else if (ord.status === "cancel") cancelCount++;

      if (ord.status !== "cancel") {
        grossRevenue += ord.total || 0;
        totalDiscount += ord.discount || 0;
      }
    });

    const validOrderCount = orders.length - cancelCount;
    const aov = validOrderCount > 0 ? Math.round(grossRevenue / validOrderCount) : 0;

    res.render("admin/pages/statistic-print.pug", {
      title: "In Báo Cáo Thống Kê Doanh Thu",
      timeRangeLabel,
      exportDate: moment().format("HH:mm - DD/MM/YYYY"),
      orders,
      summary: {
        totalOrders: orders.length,
        validOrderCount,
        completedCount,
        shippingCount,
        cancelCount,
        grossRevenue,
        totalDiscount,
        aov,
      },
    });
  } catch (error) {
    console.error("Print View Error:", error);
    req.flash("error", "Lỗi tạo bản in báo cáo: " + error.message);
    res.redirect(`/${res.locals.pathAdmin}/statistic`);
  }
};
