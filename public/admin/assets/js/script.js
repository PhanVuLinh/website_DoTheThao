// =========================================
// 1. CÁC HÀM TIỆN ÍCH CHUNG (Utility Functions)
// =========================================

// Bật/tắt hiển thị mật khẩu
function togglePassword() {
  const passInput = document.getElementById("password");
  const eyeIcon = document.querySelector(".toggle-password");

  if (passInput && eyeIcon) {
    if (passInput.type === "password") {
      passInput.type = "text";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    } else {
      passInput.type = "password";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    }
  }
}

// Hiển thị ảnh (Preview) khi chọn file
function previewImage(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("image-preview").src = e.target.result;
      document.getElementById("upload-label").classList.add("hidden");
      document.getElementById("preview-container").classList.remove("hidden");
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Xóa ảnh khi bấm dấu [X]
function removeImage() {
  document.getElementById("file-upload").value = "";
  document.getElementById("image-preview").src = "";
  document.getElementById("preview-container").classList.add("hidden");
  document.getElementById("upload-label").classList.remove("hidden");
}

//button delete
const listButtonDelete = document.querySelectorAll("[button-delete]");
if (listButtonDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-item");
  const path = formDeleteItem.getAttribute("data-path");
  listButtonDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có muốn xóa?");
      if (isConfirm) {
        const id = button.getAttribute("data-id");
        const action = `${path}/${id}?_method=DELETE`;
        formDeleteItem.action = action;
        formDeleteItem.submit();
      }
    });
  });
}
//End button delete

///filter-status lọc
const filterStatus = document.querySelector("[filter-status]");
if (filterStatus) {
  const url = new URL(window.location.href);
  filterStatus.addEventListener("change", () => {
    const value = filterStatus.value;
    if (value) {
      url.searchParams.set("status", value);
    } else {
      url.searchParams.delete("status");
    }
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get("status");
  if (valueCurrent) {
    filterStatus.value = valueCurrent;
  }
}
///end filter-status lọc

///filter-created-by lọc
const filterCreatedBy = document.querySelector("[filter-created-by]");
if (filterCreatedBy) {
  const url = new URL(window.location.href);
  filterCreatedBy.addEventListener("change", () => {
    const value = filterCreatedBy.value;
    if (value) {
      url.searchParams.set("createdBy", value);
    } else {
      url.searchParams.delete("createdBy");
    }
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get("createdBy");
  if (valueCurrent) {
    filterCreatedBy.value = valueCurrent;
  }
}
///end filter-created-by lọc

///filter start Date
const filterStartDate = document.querySelector("[filter-start-date]");
if (filterStartDate) {
  const url = new URL(window.location.href);
  filterStartDate.addEventListener("change", () => {
    const value = filterStartDate.value;
    if (value) {
      url.searchParams.set("startDate", value);
    } else {
      url.searchParams.delete("startDate");
    }
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get("startDate");
  if (valueCurrent) {
    filterStartDate.value = valueCurrent;
  }
}
///end filter start Date lọc

///filter end Date
const filterEndDate = document.querySelector("[filter-end-date]");
if (filterEndDate) {
  const url = new URL(window.location.href);
  filterEndDate.addEventListener("change", () => {
    const value = filterEndDate.value;
    if (value) {
      url.searchParams.set("endDate", value);
    } else {
      url.searchParams.delete("endDate");
    }
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get("endDate");
  if (valueCurrent) {
    filterEndDate.value = valueCurrent;
  }
}
///end filter end Date lọc

///filter reset
const filterReset = document.querySelector("[filter-reset]");
if (filterReset) {
  const url = new URL(window.location.href);
  filterReset.addEventListener("click", () => {
    url.search = "";
    window.location.href = url.href;
  });
}
///end filter reset

//Check ALL
const checkAll = document.querySelector("[check-all]");
if (checkAll) {
  checkAll.addEventListener("click", () => {
    const listCheckItem = document.querySelectorAll("[check-item]");
    listCheckItem.forEach((item) => {
      item.checked = checkAll.checked;
    });
  });
}
//end Check ALL

//Search
const search = document.querySelector("[search]");
if (search) {
  const url = new URL(window.location.href);
  search.addEventListener("keyup", (e) => {
    const value = e.target.value;
    if (e.code == "Enter") {
      if (value) {
        url.searchParams.set("keyword", value.trim());
      } else {
        url.searchParams.delete("keyword");
      }
      window.location.href = url.href;
    }
  });
  const valueCurrent = url.searchParams.get("keyword");
  if (valueCurrent) {
    search.value = valueCurrent; 
  }
}
//End Search

// =========================================
// 2. KHỞI TẠO KHI TRANG ĐÃ TẢI XONG (DOM Ready)
// =========================================
document.addEventListener("DOMContentLoaded", function () {
  // --- A. XỬ LÝ SIDEBAR ACTIVE ---
  const sider = document.querySelector(".admin-sidebar");
  if (sider) {
    const pathNameCurrent = window.location.pathname;
    const splitPathNameCurrent = pathNameCurrent.split("/");
    const menuList = sider.querySelectorAll(".sidebar-menu li a");

    menuList.forEach((item) => {
      const href = item.href;
      const pathName = new URL(href).pathname;
      const splitPathName = pathName.split("/");
      if (
        splitPathNameCurrent[1] == splitPathName[1] &&
        splitPathNameCurrent[2] == splitPathName[2]
      ) {
        item.classList.add("active");
      }
    });
  }

  // --- B. KHỞI TẠO BIỂU ĐỒ DOANH THU (Dùng cho trang Dashboard) ---
  const ctx = document.getElementById("revenueChart");
  if (ctx && typeof Chart !== "undefined") {
    const daysInMonth = Array.from({ length: 30 }, (_, i) => "Ngày " + (i + 1));
    const revenueData = [
      500000, 1200000, 800000, 2500000, 1800000, 4000000, 3500000, 5200000,
      4800000, 6000000, 4500000, 7200000, 8500000, 6800000, 5500000, 7800000,
      9000000, 10000000, 8200000, 6500000, 5000000, 4200000, 5800000, 7000000,
      8500000, 7500000, 9200000, 8800000, 9800000, 10000000,
    ];

    new Chart(ctx, {
      type: "line",
      data: {
        labels: daysInMonth,
        datasets: [
          {
            label: "Doanh thu",
            data: revenueData,
            borderColor: "#466BD6",
            backgroundColor: "rgba(70, 107, 214, 0.1)",
            borderWidth: 2,
            pointBackgroundColor: "#466BD6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 3,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                let value = context.parsed.y;
                return "Doanh thu: " + value.toLocaleString("vi-VN") + " đ";
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMin: 500000,
            suggestedMax: 10000000,
            ticks: {
              callback: function (value) {
                return value.toLocaleString("vi-VN") + " đ";
              },
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 15,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });
  }

  // --- C. SWEET ALERT FLASH MESSAGE ---
  const alertItems = document.querySelectorAll("[data-alert]");
  if (alertItems.length > 0 && typeof Swal !== "undefined") {
    alertItems.forEach((item) => {
      const type = item.dataset.alert;
      const message = item.dataset.message;
      const time = parseInt(item.dataset.time) || 3000;

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: time,
        timerProgressBar: true,
      });
    });
  } else if (alertItems.length > 0) {
    console.warn(
      "Cảnh báo: Không tìm thấy thư viện SweetAlert2, thông báo không thể hiển thị.",
    );
  }
});
