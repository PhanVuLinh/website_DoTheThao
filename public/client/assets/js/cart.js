// ==========================================
// 1. TĂNG / GIẢM SỐ LƯỢNG (Giữ nguyên logic của bạn)
// ==========================================
const handleQtyButtons = () => {
  document.querySelectorAll(".btn-qty.minus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input[name='quantity']");
      let value = parseInt(input.value);

      if (value > 1) {
        input.value = value - 1;
        input.dispatchEvent(new Event("input"));
      }
    });
  });

  document.querySelectorAll(".btn-qty.plus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input[name='quantity']");
      let value = parseInt(input.value);

      input.value = value + 1;
      input.dispatchEvent(new Event("input"));
    });
  });
};

handleQtyButtons();

// ==========================================
// 2. CẬP NHẬT TỔNG TIỀN
// ==========================================
const updateCartTotal = () => {
  const cartItems = document.querySelectorAll(".cart-item");
  let subtotal = 0;

  cartItems.forEach((item) => {
    const price = item
      .querySelector(".item-price")
      .innerText.replace(/\./g, "")
      .replace(" đ", "");

    subtotal += parseInt(price);
  });

  // TÍNH LẠI GIẢM GIÁ NẾU CÓ MÃ
  let discount = 0;
  const discountRow = document.querySelector("#discount-row");
  if (discountRow && !discountRow.classList.contains("d-none") && discountRow.style.display !== "none") {
    const percent = parseInt(discountRow.getAttribute("data-percent")) || 0;
    const max = parseInt(discountRow.getAttribute("data-max")) || 0;

    discount = (subtotal * percent) / 100;
    if (discount > max) discount = max;

    document.querySelector("#discount-val").innerText =
      "- " + discount.toLocaleString("vi-VN") + " đ";
  }

  let netAmount = subtotal - discount;
  if (netAmount < 0) netAmount = 0;

  // TÍNH PHÍ VẬN CHUYỂN ĐỘNG THEO CẤU HÌNH ADMIN
  let shippingFee = 0;
  const freeThresholdRaw = document.querySelector("#free-threshold-raw");
  const standardShippingRaw = document.querySelector("#standard-shipping-raw");
  const shippingValEl = document.querySelector("#shipping-val");
  const freeshipHintBox = document.querySelector(".freeship-hint-box");

  if (standardShippingRaw) {
    const standardShipping = parseInt(standardShippingRaw.value) || 0;
    const freeThreshold = freeThresholdRaw ? (parseInt(freeThresholdRaw.value) || 0) : 0;

    if (subtotal === 0) {
      shippingFee = 0;
    } else if (freeThreshold > 0 && netAmount >= freeThreshold) {
      shippingFee = 0;
    } else {
      shippingFee = standardShipping;
    }

    if (shippingValEl) {
      if (shippingFee === 0) {
        shippingValEl.innerText = "Miễn phí";
        shippingValEl.className = "value text-freeship";
        shippingValEl.setAttribute("data-fee", "0");
      } else {
        shippingValEl.innerText = shippingFee.toLocaleString("vi-VN") + " đ";
        shippingValEl.className = "value text-shipping";
        shippingValEl.setAttribute("data-fee", shippingFee);
      }
    }

    if (freeshipHintBox) {
      if (subtotal > 0 && shippingFee > 0 && freeThreshold > 0 && netAmount < freeThreshold) {
        const diff = freeThreshold - netAmount;
        freeshipHintBox.style.display = "flex";
        freeshipHintBox.innerHTML = `<i class="fa-solid fa-truck-fast"></i><span>Mua thêm ${diff.toLocaleString("vi-VN")} đ để được <strong>Miễn phí vận chuyển</strong>!</span>`;
      } else {
        freeshipHintBox.style.display = "none";
      }
    }
  }

  let totalPayment = netAmount + shippingFee;
  if (totalPayment < 0) totalPayment = 0;

  const cartTotals = document.querySelectorAll(".cart-total");
  if (cartTotals.length >= 2) {
    cartTotals[0].innerText = subtotal.toLocaleString("vi-VN") + " đ";
    cartTotals[1].innerText = totalPayment.toLocaleString("vi-VN") + " đ";
  }
};

// ==========================================
// 3. CẬP NHẬT SỐ LƯỢNG (Bổ sung Size vào Fetch)
// ==========================================
const handleQtyChange = () => {
  const inputsQuantity = document.querySelectorAll("input[name='quantity']");

  inputsQuantity.forEach((input) => {
    input.addEventListener("input", () => {
      const productId = input.getAttribute("product-id");
      const size = input.getAttribute("data-size") || "";
      let quantity = parseInt(input.value);

      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        input.value = 1;
      }

      const cartItem = input.closest(".cart-item");
      const priceNew = parseInt(cartItem.getAttribute("data-price-new")) || 0;

      const itemPrice = cartItem.querySelector(".item-price");
      const total = priceNew * quantity;
      if (itemPrice) {
        itemPrice.innerText = total.toLocaleString("vi-VN") + " đ";
      }

      updateCartTotal();

      fetch(`/cart/update/${productId}/${quantity}?size=${encodeURIComponent(size)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            alert(data.message);
            const oldValue = input.getAttribute("data-old");
            input.value = oldValue;
            const fallbackTotal = priceNew * parseInt(oldValue);
            if (itemPrice) {
              itemPrice.innerText = fallbackTotal.toLocaleString("vi-VN") + " đ";
            }
            updateCartTotal();
            return;
          }

          input.setAttribute("data-old", input.value);
        })
        .catch((err) => console.log(err));
    });
  });
};


handleQtyChange();

// ==========================================
// 4. ÁP DỤNG VÀ HỦY MÃ GIẢM GIÁ
// ==========================================

// Helper hiển thị thông báo
function notifyVoucher(msg, icon = "info") {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: icon,
      title: msg,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      showCloseButton: true,
      toast: true,
      position: "top-end",
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
  } else {
    alert(msg);
  }
}

// Hàm gửi request áp dụng mã
async function submitApplyCoupon(code) {
  if (!code) {
    notifyVoucher("Vui lòng nhập hoặc chọn mã giảm giá!", "warning");
    return;
  }

  try {
    const response = await fetch("/cart/apply-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code }),
    });

    const data = await response.json();

    if (data.code === 200) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "success",
          title: `Đã áp dụng mã "${code}" thành công!`,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    } else {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "error",
          title: "Không thể áp dụng mã",
          text: data.message || "Mã không hợp lệ hoặc bạn chưa đăng nhập!",
          confirmButtonText: "Đã hiểu",
          confirmButtonColor: "#0f172a",
        });
      } else {
        alert(data.message);
      }
    }
  } catch (error) {
    console.error("Lỗi áp dụng mã:", error);
    notifyVoucher("Lỗi kết nối máy chủ!", "error");
  }
}

// Hàm gửi request gỡ mã
async function submitRemoveCoupon() {
  try {
    const response = await fetch("/cart/remove-coupon", { method: "POST" });
    const data = await response.json();

    if (data.code === 200) {
      window.location.reload();
    } else {
      notifyVoucher(data.message || "Lỗi gỡ mã!", "error");
    }
  } catch (error) {
    console.error("Lỗi gỡ mã:", error);
  }
}

// 1. Áp dụng mã từ ô nhập ngoài sidebar
const btnApplyCoupon = document.querySelector("#btn-apply-coupon");
if (btnApplyCoupon) {
  btnApplyCoupon.addEventListener("click", () => {
    const codeInput = document.querySelector("#coupon-input");
    const code = codeInput ? codeInput.value.trim() : "";
    submitApplyCoupon(code);
  });
}

const inputCoupon = document.querySelector("#coupon-input");
if (inputCoupon) {
  inputCoupon.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitApplyCoupon(inputCoupon.value.trim());
    }
  });
}

// 2. Hủy mã ngoài sidebar
const btnCancelCoupon = document.querySelector("#btn-cancel-coupon");
if (btnCancelCoupon) {
  btnCancelCoupon.addEventListener("click", () => {
    submitRemoveCoupon();
  });
}

// 3. Quản lý Modal Ví Voucher
const btnOpenVoucherModal = document.querySelector("#btnOpenVoucherModal");
const voucherModal = document.querySelector("#voucherModal");
const voucherModalBackdrop = document.querySelector("#voucherModalBackdrop");
const btnCloseVoucherModal = document.querySelector("#btnCloseVoucherModal");
const btnCloseVoucherModalFooter = document.querySelector("#btnCloseVoucherModalFooter");

function openVoucherModal() {
  if (voucherModal && voucherModalBackdrop) {
    voucherModal.classList.add("is-active");
    voucherModalBackdrop.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }
}

function closeVoucherModal() {
  if (voucherModal && voucherModalBackdrop) {
    voucherModal.classList.remove("is-active");
    voucherModalBackdrop.classList.remove("is-active");
    document.body.style.overflow = "";
  }
}

if (btnOpenVoucherModal) {
  btnOpenVoucherModal.addEventListener("click", openVoucherModal);
}

if (btnCloseVoucherModal) {
  btnCloseVoucherModal.addEventListener("click", closeVoucherModal);
}

if (btnCloseVoucherModalFooter) {
  btnCloseVoucherModalFooter.addEventListener("click", closeVoucherModal);
}

if (voucherModalBackdrop) {
  voucherModalBackdrop.addEventListener("click", closeVoucherModal);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && voucherModal && voucherModal.classList.contains("is-active")) {
    closeVoucherModal();
  }
});

// 4. Áp dụng mã từ trong Modal
const btnModalApplyManual = document.querySelector("#btnModalApplyManual");
const modalCouponInput = document.querySelector("#modalCouponInput");
if (btnModalApplyManual && modalCouponInput) {
  btnModalApplyManual.addEventListener("click", () => {
    const code = modalCouponInput.value.trim();
    submitApplyCoupon(code);
  });
  modalCouponInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitApplyCoupon(modalCouponInput.value.trim());
    }
  });
}

// Click nút Áp dụng trên từng card trong modal
document.querySelectorAll(".btn-modal-apply").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const code = btn.getAttribute("data-code");
    submitApplyCoupon(code);
  });
});

// Click nút Bỏ chọn trên card trong modal
document.querySelectorAll(".btn-modal-remove").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    submitRemoveCoupon();
  });
});

// Xử lý tự động cuộn và làm nổi bật form thanh toán khi bấm "Mua Ngay"
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash === "#checkout-form") {
    const checkoutCard = document.getElementById("checkout-form");
    if (checkoutCard) {
      setTimeout(() => {
        checkoutCard.scrollIntoView({ behavior: "smooth", block: "start" });
        checkoutCard.classList.add("checkout-card-highlight");
        setTimeout(() => {
          checkoutCard.classList.remove("checkout-card-highlight");
        }, 3000);

        const fullNameInput = document.getElementById("fullName");
        if (fullNameInput && !fullNameInput.value) {
          fullNameInput.focus();
        }
      }, 350);
    }
  }
});

