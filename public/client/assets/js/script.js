// global functions
function changeImage(element) {
  const newSrc = element.src;
  const mainImage = document.getElementById("main-image");
  if (mainImage) mainImage.src = newSrc;

  const thumbs = document.querySelectorAll(".gallery-thumbs img");
  thumbs.forEach((thumb) => thumb.classList.remove("active"));

  element.classList.add("active");
}
// end global function

// active header menu
const header = document.querySelector(".nav-menu-wrapper");
if (header) {
  const currentPath = window.location.pathname;
  const menuLinks = document.querySelectorAll(".nav-links a");
  menuLinks.forEach((link) => {
    const linkPath = new URL(link.href).pathname;
    if (currentPath === linkPath) {
      link.classList.add("active");
      const dropdown = link.closest(".dropdown");
      if (dropdown) {
        const parentLi = dropdown.closest("li");
        if (parentLi) {
          const parentLink = parentLi.querySelector("a");
          if (parentLink) parentLink.classList.add("active");
        }
      }
    }
  });
}
// end active header menu

// mobile menu
const mobileToggleBtn = document.querySelector(".mobile-toggle-btn");
const mobileCloseBtn = document.querySelector(".mobile-close-btn");
const navMenuWrapper = document.querySelector(".nav-menu-wrapper");
const mobileOverlay = document.querySelector(".mobile-overlay");

if (mobileToggleBtn && navMenuWrapper && mobileOverlay) {
  const closeMenu = () => {
    navMenuWrapper.classList.remove("active");
    mobileOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
  };

  mobileToggleBtn.addEventListener("click", () => {
    navMenuWrapper.classList.add("active");
    mobileOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  mobileCloseBtn.addEventListener("click", closeMenu);
  mobileOverlay.addEventListener("click", closeMenu);
}

const menuArrows = document.querySelectorAll(".nav-links .arrow");
if (menuArrows.length > 0) {
  menuArrows.forEach((arrow) => {
    arrow.addEventListener("click", function (e) {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        const parentLi = this.closest("li");
        const dropdown = parentLi.querySelector(".dropdown");
        if (dropdown) {
          dropdown.classList.toggle("active");
          this.classList.toggle("active");
        }
      }
    });
  });
}
// end mobile menu

// slider flash deals
const flashList1 = document.querySelector(".flash-products-list");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

if (flashList1 && prevBtn && nextBtn) {
  nextBtn.addEventListener("click", () => {
    const itemWidth =
      flashList1.querySelector(".flash-product-item").offsetWidth + 20;
    flashList1.scrollBy({ left: itemWidth, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    const itemWidth =
      flashList1.querySelector(".flash-product-item").offsetWidth + 20;
    flashList1.scrollBy({ left: -itemWidth, behavior: "smooth" });
  });
}
// end slider flash deals

// sweet alert
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
}
// end sweet alert

// product detail swiper
const thumbSwiperEl = document.querySelector(".thumb-swiper");
const mainSwiperEl = document.querySelector(".main-swiper");
if (thumbSwiperEl && mainSwiperEl && typeof Swiper !== "undefined") {
  const swiperThumbs = new Swiper(".thumb-swiper", {
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
      320: { slidesPerView: 3 },
      768: { slidesPerView: 4 },
    },
  });

  new Swiper(".main-swiper", {
    spaceBetween: 10,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    thumbs: {
      swiper: swiperThumbs,
    },
  });
}
// end product detail swiper

// product quantity and size
const qtyInput = document.getElementById("quantity");
const btnPlus = document.querySelector(".btn-qty-custom.plus");
const btnMinus = document.querySelector(".btn-qty-custom.minus");

if (qtyInput && btnPlus && btnMinus) {
  const stockDisplay = document.getElementById("current-stock");
  const sizeInputs = document.querySelectorAll('input[name="size"]');
  const priceWrap = document.querySelector(".price-wrap");
  const priceNewEl = document.querySelector(".price-new");
  const priceOldEl = document.querySelector(".price-old");

  let basePrice = 0;
  let basePriceNew = 0;
  if (priceWrap) {
    basePrice = parseInt(priceWrap.getAttribute("data-base-price")) || 0;
    basePriceNew =
      parseInt(priceWrap.getAttribute("data-base-price-new")) || basePrice;
  }

  function updateTotalPrice() {
    const qty = parseInt(qtyInput.value) || 1;
    if (priceNewEl)
      priceNewEl.textContent =
        (basePriceNew * qty).toLocaleString("vi-VN") + "đ";
    if (priceOldEl)
      priceOldEl.textContent = (basePrice * qty).toLocaleString("vi-VN") + "đ";
  }

  function getCurrentStock() {
    const checkedSize = document.querySelector('input[name="size"]:checked');
    return checkedSize ? parseInt(checkedSize.dataset.stock) : 1;
  }

  function updateStock(stock) {
    if (stockDisplay) stockDisplay.textContent = stock;
    qtyInput.value = 1;
    updateTotalPrice();
  }

  sizeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      updateStock(getCurrentStock());
      const sizeLabels = document.querySelectorAll(".size-btn");
      sizeLabels.forEach((label) => label.classList.remove("active"));
      const activeLabel = input.parentElement
        ? input.parentElement.querySelector(".size-btn")
        : document.getElementById(input.id)?.nextElementSibling;
      if (activeLabel) activeLabel.classList.add("active");
    });
  });

  const defaultCheckedInput = document.querySelector(
    'input[name="size"]:checked',
  );
  if (defaultCheckedInput) {
    const activeLabel = defaultCheckedInput.parentElement
      ? defaultCheckedInput.parentElement.querySelector(".size-btn")
      : document.getElementById(defaultCheckedInput.id)?.nextElementSibling;
    if (activeLabel) activeLabel.classList.add("active");
  }


  btnPlus.addEventListener("click", () => {
    const max = getCurrentStock();
    let current = parseInt(qtyInput.value);
    if (current < max) {
      qtyInput.value = current + 1;
      updateTotalPrice();
    } else {
      alert(`Rất tiếc, size này chỉ còn tối đa ${max} sản phẩm!`);
    }
  });

  btnMinus.addEventListener("click", () => {
    let current = parseInt(qtyInput.value);
    if (current > 1) {
      qtyInput.value = current - 1;
      updateTotalPrice();
    }
  });
}
// end product quantity and size

//form search
const formSearch = document.querySelector("[form-search]");
if (formSearch) {
  const url = new URL(`${window.location.origin}/search`);
  formSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = formSearch.querySelector('input[name="keyword"]').value;
    if (keyword) {
      url.searchParams.set("keyword", keyword);
    } else {
      url.searchParams.delete("keyword");
    }
    window.location.href = url.href;
  });
}
//End form search

//sắp xếp sản phẩm
const sortSelect = document.getElementById("sort-select");

if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set("sort", value);
    window.location.href = url.href;
  });
}
//End sắp xếp sản phẩm

//Chặn click danh mục cha trên mobile để mở dropdown
document.querySelectorAll(".nav-links li").forEach((li) => {
  const link = li.querySelector("a");
  const dropdown = li.querySelector(".dropdown");

  if (dropdown && link) {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        li.classList.toggle("open");
      }
    });
  }
});


/* =========================================
   BỘ ĐẾM THỜI GIAN (FLASH DEALS TỚI CUỐI NGÀY)
   ========================================= */
const countdownBox = document.querySelector(".flash-promo__countdown");

if (countdownBox) {
  const nums = countdownBox.querySelectorAll(".num");

  if (nums.length === 3) {
    const timer = setInterval(() => {
      const now = new Date(); // Lấy thời gian hiện tại

      // Cài đặt thời gian kết thúc là 23:59:59 của ngày hôm nay
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Tính khoảng cách từ bây giờ đến cuối ngày (đơn vị: mili giây)
      const distance = endOfDay.getTime() - now.getTime();

      // Nếu hết thời gian (qua ngày mới) thì dừng đếm
      if (distance <= 0) {
        clearInterval(timer);
        nums[0].innerText = "00";
        nums[1].innerText = "00";
        nums[2].innerText = "00";
        return;
      }

      // Quy đổi mili giây ra Giờ, Phút, Giây
      // 1 giờ = 1000ms * 60s * 60m
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      // In ra màn hình (thêm "0" nếu số bé hơn 10)
      nums[0].innerText = h < 10 ? "0" + h : h;
      nums[1].innerText = m < 10 ? "0" + m : m;
      nums[2].innerText = s < 10 ? "0" + s : s;
    }, 1000); // Cập nhật lại mỗi 1 giây
  }
}

/* =========================================
   FLASH DEALS HORIZONTAL SCROLL NAVIGATION
   ========================================= */
const flashList = document.getElementById("flashProductsList");
const flashPrevBtn = document.querySelector(".flash-nav-btn--prev");
const flashNextBtn = document.querySelector(".flash-nav-btn--next");

if (flashList && flashPrevBtn && flashNextBtn) {
  flashPrevBtn.addEventListener("click", () => {
    flashList.scrollBy({ left: -320, behavior: "smooth" });
  });
  flashNextBtn.addEventListener("click", () => {
    flashList.scrollBy({ left: 320, behavior: "smooth" });
  });
}

/* =========================================
   SEARCH DRAWER TOGGLE (RESPONSIVE SEARCH)
   ========================================= */
const searchToggleBtn = document.querySelector(".search-toggle-btn");
const searchDrawer = document.getElementById("headerSearchDrawer");
const searchBackdrop = document.getElementById("headerSearchBackdrop");
const searchCloseBtn = document.getElementById("headerSearchClose");
const searchInput = document.getElementById("headerSearchInput");

if (searchToggleBtn && searchDrawer) {
  const openSearch = () => {
    searchDrawer.classList.add("is-open");
    if (searchBackdrop) searchBackdrop.classList.add("is-open");
    searchToggleBtn.classList.add("is-active");
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 150);
    }
  };

  const closeSearch = () => {
    searchDrawer.classList.remove("is-open");
    if (searchBackdrop) searchBackdrop.classList.remove("is-open");
    searchToggleBtn.classList.remove("is-active");
  };

  searchToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (searchDrawer.classList.contains("is-open")) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  if (searchCloseBtn) searchCloseBtn.addEventListener("click", closeSearch);
  if (searchBackdrop) searchBackdrop.addEventListener("click", closeSearch);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchDrawer.classList.contains("is-open")) {
      closeSearch();
    }
  });
}

/* =========================================
   VOUCHER COPY TO CLIPBOARD
   ========================================= */
const copyVoucherBtns = document.querySelectorAll(".btn-copy-voucher");
if (copyVoucherBtns.length > 0) {
  copyVoucherBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const code = this.getAttribute("data-code");
      if (!code) return;

      const performCopy = () => {
        const copyTextSpan = this.querySelector(".copy-text");
        const icon = this.querySelector("i");
        const originalText = copyTextSpan ? copyTextSpan.innerText : "Sao chép";
        if (copyTextSpan) copyTextSpan.innerText = "Đã lưu!";
        if (icon) icon.className = "fa-solid fa-check";
        this.classList.add("copied");

        if (typeof Swal !== "undefined") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `Đã sao chép mã "${code}"!`,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
        }

        setTimeout(() => {
          if (copyTextSpan) copyTextSpan.innerText = originalText;
          if (icon) icon.className = "fa-regular fa-copy";
          this.classList.remove("copied");
        }, 2200);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(performCopy).catch(() => {
          fallbackCopyText(code, performCopy);
        });
      } else {
        fallbackCopyText(code, performCopy);
      }
    });
  });

  function fallbackCopyText(text, callback) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      if (callback) callback();
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  }

  const hotVoucherBtn = document.querySelector(".btn-vault-hot-copy");
  if (hotVoucherBtn) {
    hotVoucherBtn.addEventListener("click", function () {
      const code = this.getAttribute("data-code");
      if (!code) return;

      const performHotCopy = () => {
        const span = this.querySelector("span");
        const originalText = span ? span.innerText : "Lấy mã HOT nhất";
        if (span) span.innerText = "Đã lấy mã HOT!";
        this.classList.add("copied");

        if (typeof Swal !== "undefined") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `Đã lưu mã giảm sốc nhất "${code}"!`,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });
        }

        setTimeout(() => {
          if (span) span.innerText = originalText;
          this.classList.remove("copied");
        }, 2200);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(performHotCopy).catch(() => {
          fallbackCopyText(code, performHotCopy);
        });
      } else {
        fallbackCopyText(code, performHotCopy);
      }
    });
  }
}

/* =========================================
   SPORTS HUB TABS SWITCHER
   ========================================= */
const sportsHubWrapper = document.querySelector("[sports-hub-tabs]");
if (sportsHubWrapper) {
  const tabButtons = sportsHubWrapper.querySelectorAll(".hub-tab-btn");
  const tabPanels = document.querySelectorAll(".sports-hub-panels .hub-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab-target");
      if (!targetId) return;

      tabButtons.forEach((b) => b.classList.remove("is-active"));
      tabPanels.forEach((p) => p.classList.remove("is-active"));

      btn.classList.add("is-active");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add("is-active");
      }
    });
  });
}
