/**
 * TITISPORT ADMIN - STATISTIC & ANALYTICS CLIENT CONTROLLER
 * Render multi-dimensional Chart.js visualizations, tab controls, and export tools
 */

document.addEventListener("DOMContentLoaded", function () {
  // 1. XỬ LÝ DROPDOWN MENU XUẤT EXCEL
  const exportBtn = document.getElementById("exportMenuBtn");
  const exportDropdown = document.querySelector(".export-dropdown-wrap");

  if (exportBtn && exportDropdown) {
    exportBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = exportDropdown.classList.contains("show");
      closeAllDropdowns();
      if (!isOpen) {
        exportDropdown.classList.add("show");
        const menu = exportDropdown.querySelector(".export-dropdown-menu");
        if (menu) menu.classList.add("show");
      }
    });

    document.addEventListener("click", function (e) {
      if (!exportDropdown.contains(e.target)) {
        closeAllDropdowns();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAllDropdowns();
      }
    });
  }

  function closeAllDropdowns() {
    if (exportDropdown) {
      exportDropdown.classList.remove("show");
      const menu = exportDropdown.querySelector(".export-dropdown-menu");
      if (menu) menu.classList.remove("show");
    }
  }

  // 2. XỬ LÝ CHUYỂN TABS PHÂN TÍCH (TOP SẢN PHẨM / KHÁCH HÀNG VIP / DANH MỤC)
  const tabButtons = document.querySelectorAll(".analysis-tab-btn");
  const tabContents = document.querySelectorAll(".analysis-tab-content");

  function switchTab(targetId) {
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    const activeBtn = document.querySelector(`.analysis-tab-btn[data-tab="${targetId}"]`);
    const targetContent = document.getElementById(targetId);

    if (activeBtn) activeBtn.classList.add("active");
    if (targetContent) targetContent.classList.add("active");
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = this.dataset.tab;
      switchTab(targetId);
      if (history.replaceState) {
        history.replaceState(null, null, "#" + targetId);
      }
    });
  });

  // Khôi phục tab từ URL Hash nếu có
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    if (document.getElementById(hash)) {
      switchTab(hash);
    }
  }

  // 3. KHỞI TẠO BIỂU ĐỒ CHART.JS (HỖ TRỢ TỰ ĐỘNG CHỜ THƯ VIỆN NẠP)
  let retryCount = 0;
  function ensureChartInit() {
    if (typeof Chart === "undefined") {
      if (retryCount < 20) {
        retryCount++;
        setTimeout(ensureChartInit, 100);
      } else {
        console.warn("Chart.js không thể nạp sau 20 lần thử. Bỏ qua khởi tạo biểu đồ.");
      }
      return;
    }
    initStatisticCharts();
  }

  ensureChartInit();
});

function initStatisticCharts() {
  // Cấu hình chung cho Chart.js
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  Chart.defaults.color = "#64748b";

  // ====================================================================
  // BIỂU ĐỒ 1: XU HƯỚNG DOANH THU & ĐƠN HÀNG (TIMELINE COMBO CHART)
  // ====================================================================
  const timelineCanvas = document.getElementById("timelineChart");
  if (timelineCanvas) {
    const container = timelineCanvas.closest(".chart-container-large");
    const labels = JSON.parse(container.dataset.timelineLabels || "[]");
    const revenueData = JSON.parse(container.dataset.timelineRevenue || "[]");
    const ordersData = JSON.parse(container.dataset.timelineOrders || "[]");

    const ctx = timelineCanvas.getContext("2d");

    // Tạo gradient đẹp cho line chart doanh thu
    const revGradient = ctx.createLinearGradient(0, 0, 0, 320);
    revGradient.addColorStop(0, "rgba(37, 99, 235, 0.22)");
    revGradient.addColorStop(1, "rgba(37, 99, 235, 0.0)");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            type: "line",
            label: "Doanh thu (VNĐ)",
            data: revenueData,
            borderColor: "#2563eb",
            backgroundColor: revGradient,
            borderWidth: 2.5,
            pointBackgroundColor: "#2563eb",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: labels.length > 20 ? 2 : 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
            yAxisID: "yRevenue",
            order: 1,
          },
          {
            type: "bar",
            label: "Số đơn hàng",
            data: ordersData,
            backgroundColor: "rgba(16, 185, 129, 0.45)",
            hoverBackgroundColor: "rgba(16, 185, 129, 0.75)",
            borderColor: "#10b981",
            borderWidth: 1,
            borderRadius: 5,
            barPercentage: 0.45,
            yAxisID: "yOrders",
            order: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              font: { weight: "600", size: 12 },
            },
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.94)",
            titleFont: { size: 13, weight: "700" },
            bodyFont: { size: 12.5 },
            padding: 12,
            cornerRadius: 10,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            callbacks: {
              label: function (context) {
                if (context.dataset.yAxisID === "yRevenue") {
                  return `Doanh thu: ${(context.parsed.y || 0).toLocaleString("vi-VN")} đ`;
                }
                return `Số đơn hàng: ${context.parsed.y || 0} đơn`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: labels.length > 20 ? 15 : labels.length,
              font: { size: 11 },
            },
          },
          yRevenue: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            grid: { color: "rgba(226, 232, 240, 0.6)" },
            ticks: {
              callback: function (val) {
                if (val >= 1000000) return (val / 1000000).toLocaleString("vi-VN") + " tr";
                if (val >= 1000) return (val / 1000).toLocaleString("vi-VN") + " k";
                return val;
              },
              font: { size: 11 },
            },
          },
          yOrders: {
            type: "linear",
            position: "right",
            beginAtZero: true,
            grid: { display: false },
            ticks: {
              stepSize: 1,
              callback: function (val) {
                return Number.isInteger(val) ? `${val} đh` : "";
              },
              font: { size: 11 },
            },
          },
        },
      },
    });
  }

  // ====================================================================
  // BIỂU ĐỒ 2: CƠ CẤU DOANH THU THEO DANH MỤC (DOUGHNUT)
  // ====================================================================
  const catCanvas = document.getElementById("categoryDonutChart");
  if (catCanvas) {
    const container = catCanvas.closest(".chart-container-donut");
    const labels = JSON.parse(container.dataset.categoryLabels || "[]");
    const data = JSON.parse(container.dataset.categoryRevenue || "[]");

    const palette = [
      "#2563eb", "#10b981", "#f59e0b", "#8b5cf6",
      "#ec4899", "#06b6d4", "#f97316", "#14b8a6",
      "#6366f1", "#84cc16",
    ];

    if (labels.length === 0 || data.every((v) => v === 0)) {
      new Chart(catCanvas, {
        type: "doughnut",
        data: {
          labels: ["Chưa có dữ liệu"],
          datasets: [{ data: [1], backgroundColor: ["#e2e8f0"] }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      });
    } else {
      new Chart(catCanvas, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: palette.slice(0, labels.length),
              borderWidth: 2,
              borderColor: "#ffffff",
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                padding: 12,
                font: { size: 11.5, weight: "600" },
              },
            },
            tooltip: {
              backgroundColor: "rgba(15, 23, 42, 0.94)",
              padding: 12,
              cornerRadius: 10,
              callbacks: {
                label: function (ctx) {
                  const val = ctx.parsed || 0;
                  const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                  return `${ctx.label}: ${val.toLocaleString("vi-VN")} đ (${pct}%)`;
                },
              },
            },
          },
        },
      });
    }
  }

  // ====================================================================
  // BIỂU ĐỒ 3: PHÂN BỔ TRẠNG THÁI ĐƠN HÀNG (DOUGHNUT)
  // ====================================================================
  const statusCanvas = document.getElementById("statusDoughnutChart");
  if (statusCanvas) {
    const container = statusCanvas.closest(".chart-container-donut");
    const done = parseInt(container.dataset.statusDone || 0, 10);
    const shipping = parseInt(container.dataset.statusShipping || 0, 10);
    const initial = parseInt(container.dataset.statusInitial || 0, 10);
    const cancel = parseInt(container.dataset.statusCancel || 0, 10);

    const total = done + shipping + initial + cancel;

    new Chart(statusCanvas, {
      type: "doughnut",
      data: {
        labels: ["Hoàn thành", "Đang giao hàng", "Chờ xử lý", "Đã hủy"],
        datasets: [
          {
            data: total === 0 ? [1, 0, 0, 0] : [done, shipping, initial, cancel],
            backgroundColor: total === 0
              ? ["#e2e8f0"]
              : ["#10b981", "#f59e0b", "#2563eb", "#ef4444"],
            borderWidth: 2,
            borderColor: "#ffffff",
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "66%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 12,
              font: { size: 11.5, weight: "600" },
            },
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.94)",
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: function (ctx) {
                if (total === 0) return "Chưa có đơn hàng";
                const val = ctx.parsed || 0;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return `${ctx.label}: ${val} đơn (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  // ====================================================================
  // BIỂU ĐỒ 4: PHƯƠNG THỨC THANH TOÁN (DOUGHNUT)
  // ====================================================================
  const paymentCanvas = document.getElementById("paymentDoughnutChart");
  if (paymentCanvas) {
    const container = paymentCanvas.closest(".chart-container-donut");
    const labels = JSON.parse(container.dataset.paymentLabels || "[]");
    const data = JSON.parse(container.dataset.paymentRevenue || "[]");

    const total = data.reduce((a, b) => a + b, 0);

    new Chart(paymentCanvas, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: total === 0 ? [1] : data,
            backgroundColor: total === 0
              ? ["#e2e8f0"]
              : ["#3b82f6", "#06b6d4", "#10b981", "#8b5cf6"],
            borderWidth: 2,
            borderColor: "#ffffff",
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "66%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 12,
              font: { size: 11.5, weight: "600" },
            },
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.94)",
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: function (ctx) {
                if (total === 0) return "Chưa có doanh số";
                const val = ctx.parsed || 0;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return `${ctx.label}: ${val.toLocaleString("vi-VN")} đ (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }
}
