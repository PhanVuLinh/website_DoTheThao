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
// ==========================================
// XỬ LÝ UPLOAD ẢNH (SINGLE & MULTIPLE)
// ==========================================

// 1. Upload ảnh đại diện (Single Image)
const uploadImageWrappers = document.querySelectorAll("[upload-image-wrapper]");
if (uploadImageWrappers.length > 0) {
  uploadImageWrappers.forEach((wrapper) => {
    const input = wrapper.querySelector("[upload-image-input]");
    const label = wrapper.querySelector("[upload-image-label]");
    const previewContainer = wrapper.querySelector("[upload-image-preview-container]");
    const previewImage = wrapper.querySelector("[upload-image-preview]");
    const btnRemove = wrapper.querySelector("[button-remove-image]");
    
    if (input && previewImage) {
      input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          previewImage.src = URL.createObjectURL(file);
          label.classList.add("hidden");
          previewContainer.classList.remove("hidden");
        }
      });
    }

    if (btnRemove) {
      btnRemove.addEventListener("click", () => {
        input.value = "";
        previewImage.src = "";
        previewContainer.classList.add("hidden");
        label.classList.remove("hidden");
      });
    }
  });
}

// 2. Upload thư viện ảnh (Multiple Images)
const uploadImagesInput = document.querySelector("[upload-images-input]");
const uploadImagesPreviewContainer = document.querySelector("[upload-images-preview-container]");

if (uploadImagesInput && uploadImagesPreviewContainer) {
  let dataTransfer = new DataTransfer(); 

  uploadImagesInput.addEventListener("change", (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      for (let file of files) {
        dataTransfer.items.add(file); 
        
        const src = URL.createObjectURL(file);
        const div = document.createElement("div");
        div.classList.add("image-preview-item");
        div.innerHTML = `
          <img src="${src}" />
          <button class="btn-remove-image-multi btn-remove-new" type="button" title="Xóa ảnh" data-file-name="${file.name}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        `;
        uploadImagesPreviewContainer.appendChild(div);
      }
      uploadImagesInput.files = dataTransfer.files;
    }
  });

  uploadImagesPreviewContainer.addEventListener("click", (e) => {
    const btnRemove = e.target.closest(".btn-remove-image-multi");
    if (btnRemove) {
      const item = btnRemove.closest(".image-preview-item");
      
      // NẾU LÀ ẢNH MỚI (có class btn-remove-new)
      if (btnRemove.classList.contains("btn-remove-new")) {
        const fileName = btnRemove.getAttribute("data-file-name");
        for (let i = 0; i < dataTransfer.items.length; i++) {
          if (dataTransfer.items[i].getAsFile().name === fileName) {
            dataTransfer.items.remove(i);
            break;
          }
        }
        uploadImagesInput.files = dataTransfer.files;
      }
      
      // Xóa khối hiển thị ảnh khỏi giao diện
      item.remove();
    }
  });
}
// End upload image

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

//Pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]");
if (buttonsPagination) {
  const url = new URL(window.location.href);
  buttonsPagination.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("button-pagination");
      if (page) {
        url.searchParams.set("page", page);
      } else {
        url.searchParams.delete("page");
      }
      window.location.href = url.href;
    });
  });
}
//End Pagination

//button restore
const listButtonRestore = document.querySelectorAll("[button-restore]");
if (listButtonRestore.length > 0) {
  const formRestoreItem = document.querySelector("#form-restore-item");
  const path = formRestoreItem.getAttribute("data-path");
  listButtonRestore.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const action = `${path}/${id}?_method=PATCH`;
      formRestoreItem.action = action;
      formRestoreItem.submit();
    });
  });
}
//End button restore
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
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Tính tháng trước
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Số ngày của từng tháng
  const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
  const maxDays = Math.max(daysInCurrentMonth, daysInPrevMonth);

  // Labels theo số ngày lớn nhất
  const labels = Array.from({ length: maxDays }, (_, i) => `Ngày ${i + 1}`);

  // Dữ liệu tháng hiện tại (chỉ đến ngày hiện tại, còn lại null)
  const today = now.getDate();
  const currentMonthData = Array.from({ length: maxDays }, (_, i) => {
    if (i >= daysInCurrentMonth) return null;
    if (i >= today) return null; // Ngày chưa tới thì bỏ trống
    return Math.floor(Math.random() * 9500000) + 500000; // Thay bằng data thật từ server
  });

  // Dữ liệu tháng trước (đủ cả tháng)
  const prevMonthData = Array.from({ length: maxDays }, (_, i) => {
    if (i >= daysInPrevMonth) return null;
    return Math.floor(Math.random() * 9500000) + 500000; // Thay bằng data thật từ server
  });

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Tháng ${currentMonth}/${currentYear}`,
          data: currentMonthData,
          borderColor: "#466BD6",
          backgroundColor: "rgba(70, 107, 214, 0.1)",
          borderWidth: 2,
          pointBackgroundColor: "#466BD6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 3,
          tension: 0.4,
          fill: true,
          spanGaps: false,
        },
        {
          label: `Tháng ${prevMonth}/${prevYear}`,
          data: prevMonthData,
          borderColor: "#eb5438",
          backgroundColor: "rgba(235, 84, 56, 0.08)",
          borderWidth: 2,
          pointBackgroundColor: "#eb5438",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 3,
          tension: 0.4,
          fill: true,
          spanGaps: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
            font: { size: 13, weight: "600" },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              if (context.parsed.y === null) return null;
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString("vi-VN")} đ`;
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
          ticks: { maxTicksLimit: 15 },
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
