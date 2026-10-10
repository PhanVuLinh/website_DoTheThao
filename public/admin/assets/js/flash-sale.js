// ==========================================
// FLASH SALE CAMPAIGN MANAGEMENT SCRIPTS
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#flashSaleItemsTable tbody");
  const selectedCountEl = document.querySelector("#selectedProductsCount");
  const emptyStateEl = document.querySelector("#flashSaleEmptyState");
  const tableSectionEl = document.querySelector("#flashSaleTableSection");

  // Modal elements
  const modalBackdrop = document.querySelector("#productPickerModal");
  const btnOpenModal = document.querySelector("#btnOpenProductPicker");
  const btnOpenModalEmpty = document.querySelector("#btnOpenProductPickerEmpty");
  const btnCloseModal = document.querySelector("#btnCloseProductModal");
  const btnCancelModal = document.querySelector("#btnCancelProductModal");
  const btnConfirmAdd = document.querySelector("#btnConfirmAddProducts");
  const modalSearchInput = document.querySelector("#modalSearchProduct");
  const modalCategorySelect = document.querySelector("#modalFilterCategory");
  const modalCheckAll = document.querySelector("#modalCheckAll");
  const modalSelectedCountEl = document.querySelector("#modalSelectedCount");
  const modalRows = document.querySelectorAll(".modal-product-row");

  // Bulk Apply elements
  const btnApplyBulk = document.querySelector("#btnApplyBulk");
  const bulkDiscountInput = document.querySelector("#bulkDiscount");
  const bulkQuantityInput = document.querySelector("#bulkQuantity");

  // Format currency VNĐ
  function formatVnd(number) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, number)) + " đ";
  }

  // Update counter & toggle empty state
  function updateCampaignStats() {
    const rows = tableBody ? tableBody.querySelectorAll("tr.flash-item-row") : [];
    const count = rows.length;

    if (selectedCountEl) {
      selectedCountEl.textContent = `${count} sản phẩm`;
    }

    if (count === 0) {
      if (emptyStateEl) emptyStateEl.classList.remove("d-none");
      if (tableSectionEl) tableSectionEl.classList.add("d-none");
    } else {
      if (emptyStateEl) emptyStateEl.classList.add("d-none");
      if (tableSectionEl) tableSectionEl.classList.remove("d-none");
    }

    // Cập nhật trạng thái 'checked' hoặc 'disabled' trong modal
    const currentProductIds = new Set();
    rows.forEach((r) => {
      const pid = r.getAttribute("data-product-id");
      if (pid) currentProductIds.add(pid);
    });

    modalRows.forEach((row) => {
      const pid = row.getAttribute("data-id");
      const checkbox = row.querySelector(".modal-product-checkbox");
      const badgeAdded = row.querySelector(".badge-already-added");
      if (currentProductIds.has(pid)) {
        if (badgeAdded) badgeAdded.classList.remove("d-none");
        if (checkbox) {
          checkbox.checked = false;
          checkbox.disabled = true;
        }
        row.classList.remove("is-selected");
      } else {
        if (badgeAdded) badgeAdded.classList.add("d-none");
        if (checkbox) {
          checkbox.disabled = false;
        }
      }
    });

    updateModalCheckedCount();
  }

  // Cập nhật giá flash sale trên 1 dòng
  function updateRowPrice(row) {
    const originalPrice = parseFloat(row.getAttribute("data-price") || 0);
    const discountInput = row.querySelector(".input-discount-item");
    const priceDisplay = row.querySelector(".display-sale-price");
    const diffDisplay = row.querySelector(".price-diff-pill");

    if (!discountInput || !priceDisplay) return;

    let discount = parseFloat(discountInput.value) || 0;
    if (discount < 0) discount = 0;
    if (discount > 100) discount = 100;

    const salePrice = Math.round((originalPrice * (100 - discount)) / 100);
    const diff = Math.max(0, originalPrice - salePrice);

    priceDisplay.textContent = formatVnd(salePrice);
    if (diffDisplay) {
      diffDisplay.textContent = `Tiết kiệm ${formatVnd(diff)}`;
    }
  }

  // Thêm 1 sản phẩm vào bảng Flash Sale
  function addProductToTable(productData, discount = 15, quantity = 50) {
    if (!tableBody) return;

    // Tránh trùng lặp
    const existingRow = tableBody.querySelector(`tr[data-product-id="${productData.id}"]`);
    if (existingRow) return;

    const tr = document.createElement("tr");
    tr.className = "flash-item-row";
    tr.setAttribute("data-product-id", productData.id);
    tr.setAttribute("data-price", productData.price);

    const price = parseFloat(productData.price) || 0;
    const salePrice = Math.round((price * (100 - discount)) / 100);
    const diff = Math.max(0, price - salePrice);

    tr.innerHTML = `
      <td class="text-center" width="60px">
        <input type="hidden" name="product_id" value="${productData.id}" />
        <img class="table-thumb-sm" src="${productData.thumbnail || '/client/assets/images/default.png'}" alt="${productData.title}" />
      </td>
      <td>
        <div class="product-picker-meta">
          <span class="font-weight-600 text-dark">${productData.title}</span>
          <div class="text-muted text-xs mt-1">
            <span class="badge-tag">${productData.brand || 'CHÍNH HÃNG'}</span>
            <span>Gốc: ${formatVnd(price)}</span>
          </div>
        </div>
      </td>
      <td width="130px">
        <div class="input-suffix-wrapper">
          <input class="form-control input-discount-item" type="number" name="discountPercentage" min="1" max="99" value="${discount}" required />
          <span class="suffix-text">%</span>
        </div>
      </td>
      <td width="160px">
        <span class="display-sale-price font-weight-700 text-primary">${formatVnd(salePrice)}</span>
        <div><span class="price-diff-pill">Tiết kiệm ${formatVnd(diff)}</span></div>
      </td>
      <td width="130px">
        <input class="form-control input-quantity-item" type="number" name="quantity" min="1" value="${quantity}" required />
      </td>
      <td class="text-center" width="60px">
        <button class="btn-action-icon btn-remove-item" type="button" title="Xóa khỏi chiến dịch">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    `;

    tableBody.appendChild(tr);

    // Bind sự kiện cho dòng mới
    const discountInp = tr.querySelector(".input-discount-item");
    if (discountInp) {
      discountInp.addEventListener("input", () => updateRowPrice(tr));
    }

    const btnRemove = tr.querySelector(".btn-remove-item");
    if (btnRemove) {
      btnRemove.addEventListener("click", () => {
        tr.remove();
        updateCampaignStats();
      });
    }

    updateCampaignStats();
  }

  // --- XỬ LÝ MODAL ---
  function openModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.add("show");
      document.body.style.overflow = "hidden";
      if (modalSearchInput) {
        modalSearchInput.value = "";
        modalSearchInput.focus();
      }
      if (modalCategorySelect) {
        modalCategorySelect.value = "";
      }
      filterModalProducts();
      updateCampaignStats();
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  if (btnOpenModal) btnOpenModal.addEventListener("click", openModal);
  if (btnOpenModalEmpty) btnOpenModalEmpty.addEventListener("click", openModal);
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", function (e) {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // Lọc sản phẩm trong Modal
  function filterModalProducts() {
    const keyword = modalSearchInput ? modalSearchInput.value.trim().toLowerCase() : "";
    const categoryId = modalCategorySelect ? modalCategorySelect.value : "";

    modalRows.forEach((row) => {
      const title = (row.getAttribute("data-title") || "").toLowerCase();
      const brand = (row.getAttribute("data-brand") || "").toLowerCase();
      const cat = row.getAttribute("data-category") || "";

      const matchKeyword = !keyword || title.includes(keyword) || brand.includes(keyword);
      const matchCategory = !categoryId || cat === categoryId;

      if (matchKeyword && matchCategory) {
        row.classList.remove("d-none");
      } else {
        row.classList.add("d-none");
      }
    });

    if (modalCheckAll) modalCheckAll.checked = false;
    updateModalCheckedCount();
  }

  if (modalSearchInput) {
    modalSearchInput.addEventListener("input", filterModalProducts);
  }
  if (modalCategorySelect) {
    modalCategorySelect.addEventListener("change", filterModalProducts);
  }

  // Đếm checkbox trong modal
  function updateModalCheckedCount() {
    let count = 0;
    modalRows.forEach((row) => {
      if (!row.classList.contains("d-none")) {
        const checkbox = row.querySelector(".modal-product-checkbox");
        if (checkbox && checkbox.checked && !checkbox.disabled) {
          count++;
        }
      }
    });
    if (modalSelectedCountEl) {
      modalSelectedCountEl.textContent = count;
    }
  }

  // Chọn tất cả trong modal
  if (modalCheckAll) {
    modalCheckAll.addEventListener("change", function () {
      const isChecked = modalCheckAll.checked;
      modalRows.forEach((row) => {
        if (!row.classList.contains("d-none")) {
          const checkbox = row.querySelector(".modal-product-checkbox");
          if (checkbox && !checkbox.disabled) {
            checkbox.checked = isChecked;
            if (isChecked) {
              row.classList.add("is-selected");
            } else {
              row.classList.remove("is-selected");
            }
          }
        }
      });
      updateModalCheckedCount();
    });
  }

  modalRows.forEach((row) => {
    const checkbox = row.querySelector(".modal-product-checkbox");
    if (checkbox) {
      checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
          row.classList.add("is-selected");
        } else {
          row.classList.remove("is-selected");
        }
        updateModalCheckedCount();
      });
    }

    row.addEventListener("click", function (e) {
      if (e.target.tagName.toLowerCase() === "input") return;
      if (checkbox && !checkbox.disabled) {
        checkbox.checked = !checkbox.checked;
        if (checkbox.checked) {
          row.classList.add("is-selected");
        } else {
          row.classList.remove("is-selected");
        }
        updateModalCheckedCount();
      }
    });
  });

  // Xác nhận thêm sản phẩm từ Modal vào bảng Flash Sale
  if (btnConfirmAdd) {
    btnConfirmAdd.addEventListener("click", function () {
      let addedCount = 0;
      modalRows.forEach((row) => {
        const checkbox = row.querySelector(".modal-product-checkbox");
        if (checkbox && checkbox.checked && !checkbox.disabled) {
          const productData = {
            id: row.getAttribute("data-id"),
            title: row.getAttribute("data-title"),
            price: row.getAttribute("data-price"),
            thumbnail: row.getAttribute("data-thumb"),
            brand: row.getAttribute("data-brand"),
          };
          addProductToTable(productData);
          addedCount++;
          checkbox.checked = false;
          row.classList.remove("is-selected");
        }
      });

      if (addedCount === 0) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "info",
            title: "Chưa chọn sản phẩm",
            text: "Vui lòng tick chọn ít nhất 1 sản phẩm để thêm vào chiến dịch!",
            confirmButtonColor: "#2563eb",
          });
        } else {
          alert("Vui lòng tick chọn ít nhất 1 sản phẩm!");
        }
        return;
      }

      closeModal();
      updateCampaignStats();
    });
  }

  // --- XỬ LÝ ÁP DỤNG HÀNG LOẠT (BULK APPLY) ---
  if (btnApplyBulk) {
    btnApplyBulk.addEventListener("click", function () {
      const bulkDiscount = bulkDiscountInput ? parseFloat(bulkDiscountInput.value) : null;
      const bulkQty = bulkQuantityInput ? parseInt(bulkQuantityInput.value, 10) : null;

      if ((isNaN(bulkDiscount) || bulkDiscount <= 0) && (isNaN(bulkQty) || bulkQty <= 0)) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "warning",
            title: "Thông báo",
            text: "Vui lòng nhập % Giảm giá hoặc Số lượng bán để áp dụng hàng loạt!",
            confirmButtonColor: "#2563eb",
          });
        } else {
          alert("Vui lòng nhập % giảm giá hoặc số lượng!");
        }
        return;
      }

      const rows = tableBody ? tableBody.querySelectorAll("tr.flash-item-row") : [];
      if (rows.length === 0) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "info",
            title: "Chưa có sản phẩm",
            text: "Hãy thêm sản phẩm vào chiến dịch trước khi áp dụng hàng loạt!",
            confirmButtonColor: "#2563eb",
          });
        }
        return;
      }

      rows.forEach((row) => {
        if (!isNaN(bulkDiscount) && bulkDiscount > 0) {
          const discountInput = row.querySelector(".input-discount-item");
          if (discountInput) {
            discountInput.value = Math.min(99, Math.max(1, bulkDiscount));
            updateRowPrice(row);
          }
        }
        if (!isNaN(bulkQty) && bulkQty > 0) {
          const qtyInput = row.querySelector(".input-quantity-item");
          if (qtyInput) {
            qtyInput.value = Math.max(1, bulkQty);
          }
        }
      });

      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: `Đã áp dụng cấu hình đồng loạt cho ${rows.length} sản phẩm!`,
          confirmButtonColor: "#2563eb",
          timer: 1800,
          showConfirmButton: false,
        });
      }
    });
  }

  // Khởi tạo các dòng có sẵn (Ví dụ trên trang Sửa)
  const existingRows = tableBody ? tableBody.querySelectorAll("tr.flash-item-row") : [];
  existingRows.forEach((row) => {
    const discountInp = row.querySelector(".input-discount-item");
    if (discountInp) {
      discountInp.addEventListener("input", () => updateRowPrice(row));
    }
    const btnRemove = row.querySelector(".btn-remove-item");
    if (btnRemove) {
      btnRemove.addEventListener("click", () => {
        row.remove();
        updateCampaignStats();
      });
    }
    updateRowPrice(row);
  });

  updateCampaignStats();
});
