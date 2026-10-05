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
    const previewContainer = wrapper.querySelector(
      "[upload-image-preview-container]",
    );
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
const uploadImagesPreviewContainer = document.querySelector(
  "[upload-images-preview-container]",
);

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

      item.remove();
    }
  });
}
// End upload image

//button delete
const listButtonDelete = document.querySelectorAll("[button-delete]");
if (listButtonDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-item");
  if (formDeleteItem) {
    const path = formDeleteItem.getAttribute("data-path");
    listButtonDelete.forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "Xác nhận xóa?",
            text: "Dữ liệu này sẽ được chuyển vào thùng rác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Xóa bản ghi",
            cancelButtonText: "Hủy bỏ",
            reverseButtons: true,
            focusCancel: true
          }).then((result) => {
            if (result.isConfirmed) {
              const action = `${path}/${id}?_method=DELETE`;
              formDeleteItem.action = action;
              formDeleteItem.submit();
            }
          });
        } else {
          const isConfirm = confirm("Bạn có chắc muốn xóa bản ghi này?");
          if (isConfirm) {
            const action = `${path}/${id}?_method=DELETE`;
            formDeleteItem.action = action;
            formDeleteItem.submit();
          }
        }
      });
    });
  }
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
    url.searchParams.delete("page");
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
    url.searchParams.delete("page");
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get("createdBy");
  if (valueCurrent) {
    filterCreatedBy.value = valueCurrent;
  }
}
///end filter-created-by lọc

///filter-role lọc
const filterRole = document.querySelector("[filter-role]");
if (filterRole) {
  const url = new URL(window.location.href);
  filterRole.addEventListener("change", () => {
    const value = filterRole.value;
    if (value) {
      url.searchParams.set("role", value);
    } else {
      url.searchParams.delete("role");
    }
    url.searchParams.delete("page");
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get("role");
  if (valueCurrent) {
    filterRole.value = valueCurrent;
  }
}
///end filter-role lọc

///filter start Date
const filterStartDate = document.querySelector("[filter-start-date]");
const filterEndDate = document.querySelector("[filter-end-date]");
if (filterStartDate) {
  const url = new URL(window.location.href);
  filterStartDate.addEventListener("change", () => {
    const value = filterStartDate.value;
    if (value && filterEndDate && filterEndDate.value) {
      if (value > filterEndDate.value) {
        alert("Lỗi: Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        filterStartDate.value = url.searchParams.get("startDate") || "";
        return;
      }
    }
    if (value) {
      url.searchParams.set("startDate", value);
    } else {
      url.searchParams.delete("startDate");
    }
    url.searchParams.delete("page");
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get("startDate");
  if (valueCurrent) {
    filterStartDate.value = valueCurrent;
  }
}
///end filter start Date lọc

///filter end Date
if (filterEndDate) {
  const url = new URL(window.location.href);
  filterEndDate.addEventListener("change", () => {
    const value = filterEndDate.value;
    if (value && filterStartDate && filterStartDate.value) {
      if (value < filterStartDate.value) {
        alert("Lỗi: Ngày kết thúc không được nhỏ hơn ngày bắt đầu!");
        filterEndDate.value = url.searchParams.get("endDate") || "";
        return;
      }
    }
    if (value) {
      url.searchParams.set("endDate", value);
    } else {
      url.searchParams.delete("endDate");
    }
    url.searchParams.delete("page");
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

//change-multi
const formChangeMulti = document.querySelector("#form-change-multi");
if (formChangeMulti) {
  const btnApply = document.querySelector(".btn-apply");
  const selectChangeMulti = document.querySelector("[change-multi]");

  if (btnApply && selectChangeMulti) {
    btnApply.addEventListener("click", () => {
      const type = selectChangeMulti.value;
      if (!type) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "info",
            title: "Thông báo",
            text: "Vui lòng chọn một hành động để áp dụng!",
            confirmButtonColor: "#2563eb",
          });
        } else {
          alert("Vui lòng chọn một hành động!");
        }
        return;
      }

      const listCheckItemChecked = document.querySelectorAll(
        "input[check-item]:checked",
      );
      if (listCheckItemChecked.length > 0) {
        const applyAction = () => {
          let ids = [];
          listCheckItemChecked.forEach((input) => {
            ids.push(input.value);
          });

          formChangeMulti.querySelector("input[name='type']").value = type;
          formChangeMulti.querySelector("input[name='ids']").value =
            ids.join(", ");

          const path = formChangeMulti.getAttribute("data-path");
          formChangeMulti.action = `${path}?_method=PATCH`;
          formChangeMulti.submit();
        };

        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "Xác nhận thao tác?",
            text: `Bạn có chắc muốn áp dụng hành động này cho ${listCheckItemChecked.length} bản ghi đã chọn?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Áp dụng ngay",
            cancelButtonText: "Hủy bỏ",
            reverseButtons: true,
          }).then((result) => {
            if (result.isConfirmed) {
              applyAction();
            }
          });
        } else {
          const isConfirm = confirm(
            `Bạn có chắc muốn áp dụng hành động này cho ${listCheckItemChecked.length} bản ghi?`,
          );
          if (isConfirm) {
            applyAction();
          }
        }
      } else {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "warning",
            title: "Chưa chọn bản ghi",
            text: "Vui lòng chọn ít nhất 1 bản ghi để áp dụng!",
            confirmButtonColor: "#2563eb",
          });
        } else {
          alert("Vui lòng chọn ít nhất 1 bản ghi để áp dụng!");
        }
      }
    });
  }
}
//End change-multi

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
      url.searchParams.delete("page");
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

// Bộ lọc danh mục
const filterCategory = document.querySelector("[filter-category]");
if (filterCategory) {
  const url = new URL(window.location.href);

  filterCategory.addEventListener("change", () => {
    const id = filterCategory.value;

    if (id) {
      url.searchParams.set("category", id);
    } else {
      url.searchParams.delete("category");
    }

    url.searchParams.delete("page");
    window.location.href = url.href;
  });

  const currentId = url.searchParams.get("category");
  if (currentId) {
    filterCategory.value = currentId;
  }
}
// filter reset danh mục
const filterResetCategory = document.querySelector("[filter-reset-category]");
if (filterResetCategory) {
  const url = new URL(window.location.href);
  filterResetCategory.addEventListener("click", () => {
    const filterCategory = document.querySelector("[filter-category]");

    url.search = "";

    if (filterCategory && filterCategory.options.length > 0) {
      const firstCategoryValue = filterCategory.options[0].value;
      url.searchParams.set("category", firstCategoryValue);
    }

    window.location.href = url.href;
  });
}
// endfilter reset danh mục

// Bộ lọc giá
const filterPrice = document.querySelector("[filter-price]");
if (filterPrice) {
  const url = new URL(window.location.href);

  filterPrice.addEventListener("change", () => {
    const value = filterPrice.value;
    if (value) {
      url.searchParams.set("price", value);
    } else {
      url.searchParams.delete("price");
    }
    url.searchParams.delete("page");
    window.location.href = url.href;
  });

  const currentPrice = url.searchParams.get("price");
  if (currentPrice) {
    filterPrice.value = currentPrice;
  }
}

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

///filter-payment-status lọc đơn hàng
const filtePaymentStatus = document.querySelector("[filter-payment-status]");
if (filtePaymentStatus) {
  const url = new URL(window.location.href);
  filtePaymentStatus.addEventListener("change", () => {
    const value = filtePaymentStatus.value;
    if (value) {
      url.searchParams.set("payment_status", value);
    } else {
      url.searchParams.delete("payment_status");
    }
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get("payment_status");
  if (valueCurrent) {
    filtePaymentStatus.value = valueCurrent;
  }
}
///end filter-status lọc

///filter-payment-method lọc đơn hàng
const filtePaymentMethod = document.querySelector("[filter-payment-method]");
if (filtePaymentMethod) {
  const url = new URL(window.location.href);
  filtePaymentMethod.addEventListener("change", () => {
    const value = filtePaymentMethod.value;
    if (value) {
      url.searchParams.set("payment_method", value);
    } else {
      url.searchParams.delete("payment_method");
    }
    window.location.href = url.href;
  });
  const valueCurrent = url.searchParams.get("payment_method");
  if (valueCurrent) {
    filtePaymentMethod.value = valueCurrent;
  }
}
///end filter-payment-method lọc

// ==========================================
// XỬ LÝ CHUYỂN ĐỔI TRẠNG THÁI NHANH (iOS Switch Toggle)
// ==========================================
function initStatusSwitchToggle() {
  const switchStatusInputs = document.querySelectorAll("[button-change-status]");
  if (switchStatusInputs.length === 0) return;

  switchStatusInputs.forEach((input) => {
    if (input.dataset.switchBound) return;
    input.dataset.switchBound = "true";

    input.addEventListener("change", async function () {
      const id = this.getAttribute("data-id");
      const path = this.getAttribute("data-path");
      const isChecked = this.checked;
      const newStatus = isChecked ? "active" : "inactive";
      const wrapper = this.closest(".switch-ios-wrapper");
      const label = wrapper ? wrapper.querySelector(".switch-ios-label") : null;

      // Cập nhật text & class ngay lập tức (Micro-interaction mượt mà)
      if (label) {
        label.textContent = isChecked ? "Hoạt động" : "Tạm dừng";
        if (isChecked) {
          label.classList.remove("label-inactive");
          label.classList.add("label-active");
        } else {
          label.classList.remove("label-active");
          label.classList.add("label-inactive");
        }
      }

      if (wrapper) {
        wrapper.classList.add("is-updating");
      }
      this.disabled = true;

      try {
        const response = await fetch(`${path}?_method=PATCH`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            type: newStatus,
            ids: id,
          }),
        });

        if (response.ok) {
          this.setAttribute("data-status", newStatus);
          if (typeof Swal !== "undefined") {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: `Đã đổi trạng thái thành "${isChecked ? "Hoạt động" : "Tạm dừng"}"`,
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
            });
          }
        } else {
          throw new Error("Máy chủ phản hồi lỗi!");
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        // Rollback nếu có lỗi xảy ra
        this.checked = !isChecked;
        if (label) {
          const revertChecked = this.checked;
          label.textContent = revertChecked ? "Hoạt động" : "Tạm dừng";
          if (revertChecked) {
            label.classList.remove("label-inactive");
            label.classList.add("label-active");
          } else {
            label.classList.remove("label-active");
            label.classList.add("label-inactive");
          }
        }

        if (typeof Swal !== "undefined") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Không thể cập nhật trạng thái!",
            text: "Vui lòng thử lại sau.",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      } finally {
        if (wrapper) {
          wrapper.classList.remove("is-updating");
        }
        this.disabled = false;
      }
    });
  });
}
initStatusSwitchToggle();

// =========================================
// 2. KHỞI TẠO KHI TRANG ĐÃ TẢI XONG (DOM Ready)
// =========================================
document.addEventListener("DOMContentLoaded", function () {
  initStatusSwitchToggle();
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

  // --- A1. XỬ LÝ MOBILE SIDEBAR TOGGLE & OVERLAY ---
  const sidebarToggleBtn = document.getElementById("sidebarToggle");
  const sidebarCloseBtn = document.getElementById("sidebarClose");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const adminSidebar = document.querySelector(".admin-sidebar");

  function openAdminSidebar() {
    if (adminSidebar) adminSidebar.classList.add("show");
    if (sidebarOverlay) sidebarOverlay.classList.add("active");
  }

  function closeAdminSidebar() {
    if (adminSidebar) adminSidebar.classList.remove("show");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      openAdminSidebar();
    });
  }
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", closeAdminSidebar);
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeAdminSidebar);
  }

  // --- A2. XỬ LÝ HEADER DROPDOWNS (NOTIFICATION & USER PROFILE) ---
  const notificationBtn = document.getElementById("notificationBtn");
  const notificationDropdown = document.getElementById("notificationDropdown");
  const adminProfileBtn = document.getElementById("adminProfileBtn");
  const profileDropdown = document.getElementById("profileDropdown");

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (profileDropdown) profileDropdown.classList.remove("show");
      const isOpen = notificationDropdown.classList.toggle("show");
      notificationBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  if (adminProfileBtn && profileDropdown) {
    adminProfileBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (notificationDropdown) notificationDropdown.classList.remove("show");
      const isOpen = profileDropdown.classList.toggle("show");
      adminProfileBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      const chevron = adminProfileBtn.querySelector(".profile-chevron");
      if (chevron) {
        chevron.style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
      }
    });
  }

  document.addEventListener("click", function (e) {
    if (notificationDropdown && !notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
      notificationDropdown.classList.remove("show");
      if (notificationBtn) notificationBtn.setAttribute("aria-expanded", "false");
    }
    if (profileDropdown && !profileDropdown.contains(e.target) && (!adminProfileBtn || !adminProfileBtn.contains(e.target))) {
      profileDropdown.classList.remove("show");
      if (adminProfileBtn) {
        adminProfileBtn.setAttribute("aria-expanded", "false");
        const chevron = adminProfileBtn.querySelector(".profile-chevron");
        if (chevron) chevron.style.transform = "rotate(0deg)";
      }
    }
  });

  // --- A3. PHÍM TẮT TÌM KIẾM NHANH (⌘K hoặc /) ---
  const globalSearchInput = document.getElementById("adminGlobalSearch") || document.querySelector("[search]");
  document.addEventListener("keydown", function (e) {
    const isEditing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);
    if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !isEditing) {
      if (globalSearchInput) {
        e.preventDefault();
        globalSearchInput.focus();
        if (typeof globalSearchInput.select === "function") globalSearchInput.select();
      }
    }
  });

  // --- A4. FALLBACK HÌNH ẢNH LỖI TỰ ĐỘNG ---
  document.querySelectorAll("img.td-thumbnail, img.td-avatar").forEach(function (img) {
    img.addEventListener("error", function () {
      this.src = "https://placehold.co/100x100/f1f5f9/64748b?text=SP";
    });
  });

  // --- B. KHỞI TẠO BIỂU ĐỒ DOANH THU (Dùng cho trang Dashboard) ---
  const ctx = document.getElementById("revenueChart");
  if (ctx && typeof Chart !== "undefined") {
    const container = ctx.closest(".chart-container");

    const currentMonth = container.dataset.currentMonth;
    const currentYear = container.dataset.currentYear;
    const prevMonth = container.dataset.prevMonth;
    const prevYear = container.dataset.prevYear;

    // Parse dữ liệu thật từ server
    const currentMonthData = JSON.parse(container.dataset.currentRevenue);
    const prevMonthData = JSON.parse(container.dataset.prevRevenue);

    // Số ngày lớn nhất để tạo labels
    const maxDays = Math.max(currentMonthData.length, prevMonthData.length);
    const labels = Array.from({ length: maxDays }, (_, i) => `Ngày ${i + 1}`);

    // Nếu là tháng hiện tại: ẩn các ngày chưa tới (đặt null)
    const now = new Date();
    const isCurrentMonth =
      parseInt(currentMonth) === now.getMonth() + 1 &&
      parseInt(currentYear) === now.getFullYear();

    const processedCurrentData = currentMonthData.map((val, i) => {
      if (isCurrentMonth && i >= now.getDate()) return null; // Tương lai thì trả về null
      return val; // Quá khứ (dù bán được 0 đồng) vẫn phải giữ số 0 để nó vẽ đường dây đi ngang đáy!
    });

    const processedPrevData = prevMonthData.map((val) => val);

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `Tháng ${currentMonth}/${currentYear}`,
            data: processedCurrentData,
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
            data: processedPrevData,
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
            ticks: {
              callback: function (value) {
                if (value >= 1_000_000)
                  return (value / 1_000_000).toLocaleString("vi-VN") + " tr";
                return value.toLocaleString("vi-VN") + " đ";
              },
            },
          },
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 15 },
          },
        },
        interaction: { intersect: false, mode: "index" },
      },
    });

    // Xử lý đổi tháng qua dropdown → reload trang với query
    const chartMonthSelect = document.getElementById("chartMonthSelect");
    if (chartMonthSelect) {
      chartMonthSelect.addEventListener("change", () => {
        const [month, year] = chartMonthSelect.value.split("-");
        const url = new URL(window.location.href);
        url.searchParams.set("chartMonth", month);
        url.searchParams.set("chartYear", year);
        window.location.href = url.href;
      });
    }
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
