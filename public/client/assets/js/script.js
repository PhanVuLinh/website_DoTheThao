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

// floating island header scroll handler (Kiểu 2 - Zero Jitter with rAF & Hysteresis)
const siteNavbar = document.getElementById("siteNavbar") || document.querySelector(".navbar");
const siteNavbarWrapper = document.getElementById("siteNavbarWrapper");
if (siteNavbar) {
  let isScrolled = false;
  let ticking = false;

  const updateHeaderScrollState = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (!isScrolled && scrollY > 50) {
      isScrolled = true;
      siteNavbar.classList.add("is-scrolled");
      if (siteNavbarWrapper) siteNavbarWrapper.classList.add("is-scrolled");
    } else if (isScrolled && scrollY < 20) {
      isScrolled = false;
      siteNavbar.classList.remove("is-scrolled");
      if (siteNavbarWrapper) siteNavbarWrapper.classList.remove("is-scrolled");
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderScrollState);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateHeaderScrollState();
}
// end floating island header scroll handler

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

  const lowStockAlert = document.getElementById("low-stock-alert");
  const btnAddToCart = document.getElementById("btnAddToCart") || document.querySelector(".btn-submit-cart");

  function getCurrentStock() {
    const checkedSize = document.querySelector('input[name="size"]:checked');
    return checkedSize ? parseInt(checkedSize.dataset.stock) : 1;
  }

  function updateStock(stock) {
    if (stockDisplay) stockDisplay.textContent = stock;
    qtyInput.value = 1;
    updateTotalPrice();

    const stockInfoWrap = document.getElementById("stock-info-wrap");
    if (stock <= 0) {
      if (stockInfoWrap) stockInfoWrap.style.display = "none";
      if (lowStockAlert) {
        lowStockAlert.style.display = "inline-flex";
        lowStockAlert.className = "low-stock-pill pill-danger";
        lowStockAlert.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> <span class="pill-text">Tạm hết hàng</span>';
      }
      if (btnAddToCart) {
        btnAddToCart.disabled = true;
        btnAddToCart.classList.add("disabled");
        const spanText = btnAddToCart.querySelector("span");
        if (spanText) spanText.textContent = "Tạm Hết Hàng";
      }
    } else if (stock <= 3) {
      if (stockInfoWrap) stockInfoWrap.style.display = "none";
      if (lowStockAlert) {
        lowStockAlert.style.display = "inline-flex";
        lowStockAlert.className = "low-stock-pill pill-warning pill-pulse";
        lowStockAlert.innerHTML = `<i class="fa-solid fa-fire-flame-curved"></i> <span class="pill-text">Chỉ còn ${stock} sản phẩm - Nhanh tay kẻo lỡ!</span>`;
      }
      if (btnAddToCart) {
        btnAddToCart.disabled = false;
        btnAddToCart.classList.remove("disabled");
        const spanText = btnAddToCart.querySelector("span");
        if (spanText) spanText.textContent = "Thêm Vào Giỏ Hàng";
      }
    } else {
      if (stockInfoWrap) stockInfoWrap.style.display = "inline-flex";
      if (lowStockAlert) lowStockAlert.style.display = "none";
      if (btnAddToCart) {
        btnAddToCart.disabled = false;
        btnAddToCart.classList.remove("disabled");
        const spanText = btnAddToCart.querySelector("span");
        if (spanText) spanText.textContent = "Thêm Vào Giỏ Hàng";
      }
    }
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

  // Trigger initial stock check
  updateStock(getCurrentStock());

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

/* =========================================
   SIZE GUIDE MODAL & INTERACTIVE CALCULATOR
   ========================================= */
const btnOpenSizeGuide = document.getElementById("btnOpenSizeGuide");
const btnCloseSizeGuide = document.getElementById("btnCloseSizeGuide");
const sizeGuideModal = document.getElementById("sizeGuideModal");

if (btnOpenSizeGuide && sizeGuideModal) {
  const openModal = () => {
    sizeGuideModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    sizeGuideModal.style.display = "none";
    document.body.style.overflow = "auto";
  };

  btnOpenSizeGuide.addEventListener("click", openModal);
  if (btnCloseSizeGuide) {
    btnCloseSizeGuide.addEventListener("click", closeModal);
  }
  sizeGuideModal.addEventListener("click", (e) => {
    if (e.target === sizeGuideModal) closeModal();
  });

  // Tab switching
  const guideTabBtns = sizeGuideModal.querySelectorAll(".guide-tab-btn");
  const guideTabContents = sizeGuideModal.querySelectorAll(".guide-tab-content");
  const calcFootwearInputs = document.getElementById("calcFootwearInputs");
  const calcApparelInputs = document.getElementById("calcApparelInputs");
  const calcResultBox = document.getElementById("calcResultBox");
  const suggestedSizeBadge = document.getElementById("suggestedSizeBadge");
  const btnApplySuggestedSize = document.getElementById("btnApplySuggestedSize");

  guideTabBtns.forEach((tabBtn) => {
    tabBtn.addEventListener("click", () => {
      const targetId = tabBtn.getAttribute("data-target");
      guideTabBtns.forEach((b) => b.classList.remove("active"));
      guideTabContents.forEach((c) => c.classList.remove("active"));

      tabBtn.classList.add("active");
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add("active");

      if (targetId === "tabFootwear") {
        if (calcFootwearInputs) calcFootwearInputs.style.display = "flex";
        if (calcApparelInputs) calcApparelInputs.style.display = "none";
      } else {
        if (calcFootwearInputs) calcFootwearInputs.style.display = "none";
        if (calcApparelInputs) calcApparelInputs.style.display = "flex";
      }
      if (calcResultBox) calcResultBox.style.display = "none";
    });
  });

  // Calculate Shoe Size
  const btnCalcShoeSize = document.getElementById("btnCalcShoeSize");
  const inputFootLength = document.getElementById("calcFootLength");

  if (btnCalcShoeSize && inputFootLength) {
    btnCalcShoeSize.addEventListener("click", () => {
      const cm = parseFloat(inputFootLength.value);
      if (isNaN(cm) || cm < 20 || cm > 32) {
        alert("Vui lòng nhập chiều dài bàn chân hợp lệ từ 20cm đến 32cm!");
        return;
      }
      let suggested = "41";
      if (cm <= 23.0) suggested = "36";
      else if (cm <= 23.5) suggested = "37";
      else if (cm <= 24.0) suggested = "38";
      else if (cm <= 24.5) suggested = "39";
      else if (cm <= 25.0) suggested = "40";
      else if (cm <= 25.5) suggested = "41";
      else if (cm <= 26.0) suggested = "42";
      else if (cm <= 26.5) suggested = "43";
      else if (cm <= 27.0) suggested = "44";
      else suggested = "45";

      if (suggestedSizeBadge) suggestedSizeBadge.textContent = suggested;
      if (calcResultBox) calcResultBox.style.display = "flex";
      if (btnApplySuggestedSize) btnApplySuggestedSize.setAttribute("data-size", suggested);
    });
  }

  // Calculate Apparel Size
  const btnCalcApparelSize = document.getElementById("btnCalcApparelSize");
  const inputHeight = document.getElementById("calcHeight");
  const inputWeight = document.getElementById("calcWeight");

  if (btnCalcApparelSize && inputHeight && inputWeight) {
    btnCalcApparelSize.addEventListener("click", () => {
      const h = parseFloat(inputHeight.value);
      const w = parseFloat(inputWeight.value);
      if (isNaN(h) || isNaN(w) || h < 140 || h > 210 || w < 35 || w > 130) {
        alert("Vui lòng nhập chiều cao và cân nặng hợp lệ!");
        return;
      }
      let suggested = "L";
      if (w < 56 && h <= 165) suggested = "S";
      else if (w <= 65 && h <= 172) suggested = "M";
      else if (w <= 74 && h <= 177) suggested = "L";
      else if (w <= 84 && h <= 183) suggested = "XL";
      else suggested = "XXL";

      if (suggestedSizeBadge) suggestedSizeBadge.textContent = suggested;
      if (calcResultBox) calcResultBox.style.display = "flex";
      if (btnApplySuggestedSize) btnApplySuggestedSize.setAttribute("data-size", suggested);
    });
  }

  // Apply suggested size to form
  if (btnApplySuggestedSize) {
    btnApplySuggestedSize.addEventListener("click", () => {
      const suggested = btnApplySuggestedSize.getAttribute("data-size");
      if (!suggested) return;

      const sizeRadios = document.querySelectorAll('input[name="size"]');
      let found = false;
      sizeRadios.forEach((radio) => {
        const val = radio.value.toLowerCase().replace(/size:\s*/i, "").trim();
        if (val === suggested.toLowerCase() && !radio.disabled) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change"));
          found = true;
        }
      });

      closeModal();

      if (found) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "success",
            title: "Đã chọn kích cỡ!",
            text: `Hệ thống đã chọn Size ${suggested} phù hợp với bạn.`,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        alert(`Đã gợi ý Size ${suggested}, nhưng rất tiếc size này hiện đang tạm hết hàng.`);
      }
    });
  }
}


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

/* =========================================
   CLIENT PAGINATION HANDLER
   ========================================= */
const clientPaginationButtons = document.querySelectorAll("[button-pagination]");
if (clientPaginationButtons.length > 0) {
  clientPaginationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("button-pagination");
      const url = new URL(window.location.href);
      if (page) {
        url.searchParams.set("page", page);
      } else {
        url.searchParams.delete("page");
      }
      window.location.href = url.href;
    });
  });
}

/* =========================================
   HOMEPAGE ALTERNATING SECTIONS (XÁM - TRẮNG)
   ========================================= */
function applyAlternatingSectionBgs() {
  const sections = document.querySelectorAll(".home-section");
  if (!sections || sections.length === 0) return;

  let isGray = true; // Bắt đầu bằng Xám (Kho Voucher)
  sections.forEach((sec) => {
    const style = window.getComputedStyle(sec);
    if (style.display !== "none" && !sec.hidden && !sec.classList.contains("d-none")) {
      if (isGray) {
        sec.classList.remove("section-bg-white");
        sec.classList.add("section-bg-gray");
      } else {
        sec.classList.remove("section-bg-gray");
        sec.classList.add("section-bg-white");
      }
      isGray = !isGray;
    }
  });
}

document.addEventListener("DOMContentLoaded", applyAlternatingSectionBgs);

/* =========================================
   CANCEL ORDER HANDLER (CLIENT)
   ========================================= */
const cancelOrderBtns = document.querySelectorAll(".btn-cancel-order");
if (cancelOrderBtns.length > 0) {
  cancelOrderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const orderId = btn.getAttribute("data-id");
      const orderCode = btn.getAttribute("data-code") || "";
      if (!orderId) return;

      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Hủy đơn hàng?",
          html: `
            <p style="font-size: 14px; color: #64748b; margin-bottom: 14px; text-align: left;">
              Bạn có chắc muốn hủy đơn hàng <strong>#${orderCode}</strong>? Toàn bộ số lượng sản phẩm và mã ưu đãi (nếu có) sẽ được hoàn lại tự động.
            </p>
            <div style="text-align: left;">
              <label style="font-weight: 600; font-size: 13px; display: block; margin-bottom: 6px; color: #1e293b;">
                Vui lòng chọn lý do hủy:
              </label>
              <select id="swalCancelReasonSelect" class="swal2-select" style="width: 100%; margin: 0 0 10px 0; font-size: 14px; border-radius: 8px; border: 1px solid #cbd5e1; padding: 8px;">
                <option value="Tôi muốn thay đổi địa chỉ nhận hàng">Tôi muốn thay đổi địa chỉ nhận hàng</option>
                <option value="Tôi muốn thay đổi kích cỡ / sản phẩm">Tôi muốn thay đổi kích cỡ / sản phẩm</option>
                <option value="Tôi tìm thấy giá tốt hơn ở nơi khác">Tôi tìm thấy giá tốt hơn ở nơi khác</option>
                <option value="Tôi không có nhu cầu mua nữa">Tôi không có nhu cầu mua nữa</option>
                <option value="other">Lý do khác (tự nhập)...</option>
              </select>
              <input id="swalCancelReasonCustom" class="swal2-input" placeholder="Nhập lý do chi tiết..." style="display: none; width: 100%; margin: 0; font-size: 14px; border-radius: 8px; border: 1px solid #cbd5e1; padding: 8px;" />
            </div>
          `,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ef4444",
          cancelButtonColor: "#94a3b8",
          confirmButtonText: "Xác nhận hủy",
          cancelButtonText: "Đóng",
          didOpen: () => {
            const selectEl = document.getElementById("swalCancelReasonSelect");
            const customInput = document.getElementById("swalCancelReasonCustom");
            if (selectEl && customInput) {
              selectEl.addEventListener("change", () => {
                if (selectEl.value === "other") {
                  customInput.style.display = "block";
                  customInput.focus();
                } else {
                  customInput.style.display = "none";
                }
              });
            }
          },
          preConfirm: () => {
            const selectEl = document.getElementById("swalCancelReasonSelect");
            const customInput = document.getElementById("swalCancelReasonCustom");
            let reason = selectEl ? selectEl.value : "";
            if (reason === "other") {
              reason = (customInput && customInput.value.trim()) ? customInput.value.trim() : "Khách hàng đổi ý";
            }
            return reason;
          },
        }).then((result) => {
          if (result.isConfirmed) {
            const cancelReason = result.value || "Khách yêu cầu hủy đơn";
            const form = document.createElement("form");
            form.method = "POST";
            form.action = `/order/cancel/${orderId}`;
            form.style.display = "none";

            const methodInput = document.createElement("input");
            methodInput.type = "hidden";
            methodInput.name = "_method";
            methodInput.value = "PATCH";
            form.appendChild(methodInput);

            const reasonInput = document.createElement("input");
            reasonInput.type = "hidden";
            reasonInput.name = "cancelReason";
            reasonInput.value = cancelReason;
            form.appendChild(reasonInput);

            document.body.appendChild(form);
            form.submit();
          }
        });
      } else {
        if (confirm(`Bạn có chắc muốn hủy đơn hàng #${orderCode}?`)) {
          const reason = prompt("Lý do hủy đơn hàng:", "Đổi ý không mua nữa");
          if (reason !== null) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = `/order/cancel/${orderId}`;
            form.style.display = "none";

            const reasonInput = document.createElement("input");
            reasonInput.type = "hidden";
            reasonInput.name = "cancelReason";
            reasonInput.value = reason || "Khách hàng hủy đơn";
            form.appendChild(reasonInput);

            document.body.appendChild(form);
            form.submit();
          }
        }
      }
    });
  });
}

/* =========================================
   WISHLIST SYSTEM (LOCALSTORAGE SYNC)
   ========================================= */
const WISHLIST_KEY = "titisport_wishlist";

function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveWishlist(list) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Lỗi lưu wishlist:", e);
  }
}

function updateWishlistCounter() {
  const counterEl = document.getElementById("wishlist-counter");
  if (!counterEl) return;
  const list = getWishlist();
  if (list.length > 0) {
    counterEl.textContent = list.length;
    counterEl.style.display = "inline-flex";
  } else {
    counterEl.style.display = "none";
  }
}

function syncWishlistHeartStates() {
  const list = getWishlist();
  const ids = new Set(list.map((item) => String(item.id)));

  // Update card toggle buttons
  const toggleBtns = document.querySelectorAll(".btn-wishlist-toggle");
  toggleBtns.forEach((btn) => {
    const id = btn.getAttribute("data-id");
    const icon = btn.querySelector("i");
    if (ids.has(String(id))) {
      btn.classList.add("is-active");
      if (icon) {
        icon.className = "fa-solid fa-heart";
      }
    } else {
      btn.classList.remove("is-active");
      if (icon) {
        icon.className = "fa-regular fa-heart";
      }
    }
  });

  // Update product detail page button
  const detailBtn = document.getElementById("btnWishlistDetail");
  if (detailBtn) {
    const id = detailBtn.getAttribute("data-id");
    const icon = detailBtn.querySelector("i");
    const textSpan = detailBtn.querySelector("span");
    if (ids.has(String(id))) {
      detailBtn.classList.add("is-active");
      if (icon) icon.className = "fa-solid fa-heart";
      if (textSpan) textSpan.textContent = "Đã Yêu Thích";
    } else {
      detailBtn.classList.remove("is-active");
      if (icon) icon.className = "fa-regular fa-heart";
      if (textSpan) textSpan.textContent = "Yêu Thích";
    }
  }
}

function renderWishlistPage() {
  const gridEl = document.getElementById("wishlistGrid");
  const emptyEl = document.getElementById("wishlistEmpty");
  const clearBtn = document.getElementById("btnClearWishlist");
  if (!gridEl) return;

  const list = getWishlist();
  if (list.length === 0) {
    gridEl.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "flex";
    if (clearBtn) clearBtn.style.display = "none";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  if (clearBtn) clearBtn.style.display = "inline-flex";

  let html = "";
  list.forEach((item) => {
    const priceFormatted = Number(item.price || 0).toLocaleString("vi-VN") + "đ";
    const priceOldFormatted = item.priceOld && Number(item.priceOld) > Number(item.price)
      ? Number(item.priceOld).toLocaleString("vi-VN") + "đ"
      : "";

    html += `
      <div class="wishlist-card" data-id="${item.id}">
        <div class="wishlist-card__img-wrap">
          <a href="/product/detail/${item.slug}">
            <img src="${item.thumbnail}" alt="${item.title}" onerror="this.src='https://placehold.co/300x300/f1f5f9/94a3b8?text=Sport'" />
          </a>
          <button class="btn-remove-wishlist-item" data-id="${item.id}" type="button" title="Xóa khỏi yêu thích">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="wishlist-card__info">
          <h3 class="wishlist-card__title">
            <a href="/product/detail/${item.slug}" title="${item.title}">${item.title}</a>
          </h3>
          <div class="wishlist-card__price">
            <span class="price-current">${priceFormatted}</span>
            ${priceOldFormatted ? `<span class="price-old">${priceOldFormatted}</span>` : ""}
          </div>
          <div class="wishlist-card__actions">
            <a href="/product/detail/${item.slug}" class="btn-wishlist-view">
              <i class="fa-solid fa-cart-shopping"></i> Xem & Đặt Mua
            </a>
          </div>
        </div>
      </div>
    `;
  });

  gridEl.innerHTML = html;

  // Add click listener to individual remove buttons on wishlist page
  const removeBtns = gridEl.querySelectorAll(".btn-remove-wishlist-item");
  removeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      let currentList = getWishlist();
      currentList = currentList.filter((x) => String(x.id) !== String(id));
      saveWishlist(currentList);
      updateWishlistCounter();
      syncWishlistHeartStates();
      renderWishlistPage();

      if (typeof Swal !== "undefined") {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "Đã xóa khỏi danh sách yêu thích",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  });
}

// Global click event delegation for wishlist toggles
document.addEventListener("click", (e) => {
  const toggleBtn = e.target.closest(".btn-wishlist-toggle, #btnWishlistDetail");
  if (!toggleBtn) return;
  e.preventDefault();
  e.stopPropagation();

  const id = toggleBtn.getAttribute("data-id");
  if (!id) return;

  const title = toggleBtn.getAttribute("data-title") || "";
  const slug = toggleBtn.getAttribute("data-slug") || "";
  const price = toggleBtn.getAttribute("data-price") || 0;
  const priceOld = toggleBtn.getAttribute("data-price-old") || "";
  const thumbnail = toggleBtn.getAttribute("data-thumbnail") || "";

  let list = getWishlist();
  const existingIdx = list.findIndex((item) => String(item.id) === String(id));

  if (existingIdx > -1) {
    // Remove
    list.splice(existingIdx, 1);
    saveWishlist(list);
    updateWishlistCounter();
    syncWishlistHeartStates();
    if (document.getElementById("wishlistGrid")) {
      renderWishlistPage();
    }
    if (typeof Swal !== "undefined") {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "Đã bỏ yêu thích",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } else {
    // Add
    list.unshift({
      id: id,
      title: title,
      slug: slug,
      price: price,
      priceOld: priceOld,
      thumbnail: thumbnail,
    });
    saveWishlist(list);
    updateWishlistCounter();
    syncWishlistHeartStates();
    if (document.getElementById("wishlistGrid")) {
      renderWishlistPage();
    }
    if (typeof Swal !== "undefined") {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Đã lưu vào danh sách yêu thích!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }
});

// Clear all wishlist button
const btnClearWishlist = document.getElementById("btnClearWishlist");
if (btnClearWishlist) {
  btnClearWishlist.addEventListener("click", () => {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "Xóa toàn bộ danh sách yêu thích?",
        text: "Bạn có chắc muốn xóa tất cả sản phẩm đã lưu không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#94a3b8",
        confirmButtonText: "Xóa tất cả",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          saveWishlist([]);
          updateWishlistCounter();
          syncWishlistHeartStates();
          renderWishlistPage();
        }
      });
    } else {
      if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm yêu thích?")) {
        saveWishlist([]);
        updateWishlistCounter();
        syncWishlistHeartStates();
        renderWishlistPage();
      }
    }
  });
}

// =========================================================
// PRODUCT COMPARISON SYSTEM (HỆ THỐNG SO SÁNH SẢN PHẨM)
// =========================================================
const COMPARE_KEY = "titisport_compare";
const MAX_COMPARE = 4;

function getCompareList() {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Lỗi đọc compare list:", e);
    return [];
  }
}

function saveCompareList(list) {
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Lỗi lưu compare list:", e);
  }
}

function updateCompareCounter() {
  const counterEl = document.getElementById("compare-counter");
  const dockCounterEl = document.getElementById("compareDockCount");
  const list = getCompareList();
  const count = list.length;

  if (counterEl) {
    if (count > 0) {
      counterEl.textContent = count;
      counterEl.style.display = "flex";
    } else {
      counterEl.style.display = "none";
    }
  }

  if (dockCounterEl) {
    dockCounterEl.textContent = count;
  }
}

function syncCompareButtonStates() {
  const list = getCompareList();
  const idSet = new Set(list.map((item) => String(item.id)));

  // 1. Nút toggle trên các thẻ sản phẩm
  const toggleBtns = document.querySelectorAll(".btn-compare-toggle");
  toggleBtns.forEach((btn) => {
    const id = btn.getAttribute("data-id");
    if (id && idSet.has(String(id))) {
      btn.classList.add("is-active");
      btn.setAttribute("title", "Đã có trong danh sách so sánh");
    } else {
      btn.classList.remove("is-active");
      btn.setAttribute("title", "So sánh sản phẩm");
    }
  });

  // 2. Nút toggle trên trang chi tiết sản phẩm
  const detailBtn = document.getElementById("btnCompareDetail");
  if (detailBtn) {
    const id = detailBtn.getAttribute("data-id");
    if (id && idSet.has(String(id))) {
      detailBtn.classList.add("is-active");
      const span = detailBtn.querySelector("span");
      if (span) span.textContent = "Đang so sánh";
    } else {
      detailBtn.classList.remove("is-active");
      const span = detailBtn.querySelector("span");
      if (span) span.textContent = "So sánh";
    }
  }
}

function renderCompareDock() {
  const dockEl = document.getElementById("compareDock");
  const itemsContainer = document.getElementById("compareDockItems");
  const btnDockCompare = document.getElementById("btnDockCompare");
  if (!dockEl || !itemsContainer) return;

  const list = getCompareList();

  if (list.length === 0) {
    dockEl.style.display = "none";
    return;
  }

  // Hiển thị thanh dock
  dockEl.style.display = "block";

  // Cập nhật link so sánh
  if (btnDockCompare) {
    const idsQuery = list.map((item) => item.id).join(",");
    btnDockCompare.href = `/compare?ids=${idsQuery}`;
  }

  // Render 4 slots (các slot có sản phẩm và các slot trống)
  let slotsHtml = "";
  for (let i = 0; i < MAX_COMPARE; i++) {
    if (i < list.length) {
      const item = list[i];
      const thumb = item.thumbnail || "https://placehold.co/400x400/f8fafc/94a3b8?text=TITISPORT";
      const formattedPrice = Number(item.price || 0).toLocaleString("vi-VN") + "đ";

      slotsHtml += `
        <div class="dock-slot dock-slot--filled" data-id="${item.id}">
          <div class="dock-slot__thumb">
            <img src="${thumb}" alt="${item.title}" onerror="this.src='https://placehold.co/400x400/f8fafc/94a3b8?text=TITISPORT'" />
          </div>
          <div class="dock-slot__meta">
            <div class="dock-slot__title" title="${item.title}">${item.title}</div>
            <div class="dock-slot__price">${formattedPrice}</div>
          </div>
          <button type="button" class="btn-dock-slot-remove" data-id="${item.id}" title="Xóa khỏi so sánh" aria-label="Xóa">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;
    } else {
      slotsHtml += `
        <div class="dock-slot dock-slot--empty">
          <i class="fa-solid fa-plus"></i>
          <span>Thêm sản phẩm</span>
        </div>
      `;
    }
  }

  itemsContainer.innerHTML = slotsHtml;

  // Gắn sự kiện xóa trên từng slot trong dock
  const removeSlotBtns = itemsContainer.querySelectorAll(".btn-dock-slot-remove");
  removeSlotBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      if (id) {
        removeCompareItem(id);
      }
    });
  });
}

function removeCompareItem(id) {
  let list = getCompareList();
  list = list.filter((item) => String(item.id) !== String(id));
  saveCompareList(list);
  updateCompareCounter();
  syncCompareButtonStates();
  renderCompareDock();

  // Nếu đang ở trang /compare, xóa cột tương ứng trên bảng
  if (document.getElementById("compareTable")) {
    handleRemoveColumnOnComparePage(id);
  }
}

function handleRemoveColumnOnComparePage(id) {
  const table = document.getElementById("compareTable");
  if (!table) return;

  const cols = table.querySelectorAll(`[data-id="${id}"]`);
  cols.forEach((col) => {
    col.style.transition = "opacity 0.25s, transform 0.25s";
    col.style.opacity = "0";
    col.style.transform = "scale(0.95)";
    setTimeout(() => {
      col.remove();
      checkCompareTableColumns();
    }, 250);
  });
}

function checkCompareTableColumns() {
  const table = document.getElementById("compareTable");
  const emptyBox = document.getElementById("compareEmpty");
  const wrapper = document.querySelector(".compare-table-wrapper");
  const headerRight = document.querySelector(".compare-header-right");
  if (!table) return;

  const remainingCols = table.querySelectorAll("thead tr.compare-row--head th.compare-col--product");
  const count = remainingCols.length;

  const countSpan = document.querySelector(".col-label-inner .feature-count");
  if (countSpan) {
    countSpan.textContent = `${count} sản phẩm`;
  }

  if (count === 0) {
    if (wrapper) wrapper.style.display = "none";
    if (headerRight) headerRight.style.display = "none";
    if (emptyBox) emptyBox.style.display = "flex";

    // Cập nhật URL sạch không còn query ids
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, "/compare");
    }
  } else {
    // Cập nhật lại query param trên thanh URL
    const list = getCompareList();
    if (window.history && window.history.replaceState && list.length > 0) {
      const newQuery = list.map((i) => i.id).join(",");
      window.history.replaceState({}, document.title, `/compare?ids=${newQuery}`);
    }
    // Kiểm tra lại khác biệt sau khi gỡ cột
    checkRowDifferences();
  }
}

function checkRowDifferences() {
  const toggleDiff = document.getElementById("toggleOnlyDiff");
  const isDiffOnly = toggleDiff ? toggleDiff.checked : false;

  const rows = document.querySelectorAll(".compare-table tbody tr.compare-row[data-row-name]");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td.compare-col--product");
    if (cells.length <= 1) {
      row.classList.remove("is-identical", "is-hidden-diff", "is-different-highlight");
      return;
    }

    const firstVal = (cells[0].getAttribute("data-val") || "").trim().toLowerCase();
    let isAllSame = true;

    for (let i = 1; i < cells.length; i++) {
      const val = (cells[i].getAttribute("data-val") || "").trim().toLowerCase();
      if (val !== firstVal) {
        isAllSame = false;
        break;
      }
    }

    if (isAllSame) {
      row.classList.add("is-identical");
      row.classList.remove("is-different-highlight");
      if (isDiffOnly) {
        row.classList.add("is-hidden-diff");
      } else {
        row.classList.remove("is-hidden-diff");
      }
    } else {
      row.classList.remove("is-identical", "is-hidden-diff");
      if (isDiffOnly) {
        row.classList.add("is-different-highlight");
      } else {
        row.classList.remove("is-different-highlight");
      }
    }
  });
}

// Global click event delegation cho các nút So Sánh
document.addEventListener("click", (e) => {
  const toggleBtn = e.target.closest(".btn-compare-toggle, #btnCompareDetail");
  if (toggleBtn) {
    e.preventDefault();
    e.stopPropagation();

    const id = toggleBtn.getAttribute("data-id");
    const title = toggleBtn.getAttribute("data-title") || "Sản phẩm";
    const slug = toggleBtn.getAttribute("data-slug") || "";
    const price = toggleBtn.getAttribute("data-price") || 0;
    const priceOld = toggleBtn.getAttribute("data-price-old") || price;
    const thumbnail = toggleBtn.getAttribute("data-thumbnail") || "";
    const brand = toggleBtn.getAttribute("data-brand") || "CHÍNH HÃNG";

    if (!id) return;

    let list = getCompareList();
    const existingIndex = list.findIndex((item) => String(item.id) === String(id));

    if (existingIndex > -1) {
      // Đã có -> Xóa khỏi danh sách so sánh
      list.splice(existingIndex, 1);
      saveCompareList(list);
      updateCompareCounter();
      syncCompareButtonStates();
      renderCompareDock();

      if (typeof Swal !== "undefined") {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "Đã xóa khỏi danh sách so sánh",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } else {
      // Chưa có -> Kiểm tra giới hạn tối đa 4 sản phẩm
      if (list.length >= MAX_COMPARE) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "warning",
            title: "Đã đạt giới hạn so sánh",
            text: `Bạn chỉ có thể so sánh tối đa ${MAX_COMPARE} sản phẩm cùng lúc. Vui lòng bỏ bớt để thêm sản phẩm mới.`,
            confirmButtonColor: "#2563eb",
            confirmButtonText: "Đã hiểu",
          });
        } else {
          alert(`Bạn chỉ có thể so sánh tối đa ${MAX_COMPARE} sản phẩm cùng lúc!`);
        }
        return;
      }

      list.push({
        id: id,
        title: title,
        slug: slug,
        price: price,
        priceOld: priceOld,
        thumbnail: thumbnail,
        brand: brand,
      });

      saveCompareList(list);
      updateCompareCounter();
      syncCompareButtonStates();
      renderCompareDock();

      if (typeof Swal !== "undefined") {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Đã thêm vào danh sách so sánh!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  }
});

// Setup các điều khiển cho Floating Dock
const btnToggleCompareDock = document.getElementById("btnToggleCompareDock");
const btnCloseCompareDock = document.getElementById("btnCloseCompareDock");
const btnDockClear = document.getElementById("btnDockClear");
const compareDock = document.getElementById("compareDock");

if (btnToggleCompareDock && compareDock) {
  btnToggleCompareDock.addEventListener("click", () => {
    compareDock.classList.toggle("is-collapsed");
  });
}

if (btnCloseCompareDock && compareDock) {
  btnCloseCompareDock.addEventListener("click", () => {
    compareDock.style.display = "none";
  });
}

if (btnDockClear) {
  btnDockClear.addEventListener("click", () => {
    clearAllCompare();
  });
}

// Setup nút xóa trên trang /compare
const btnClearComparePage = document.getElementById("btnClearComparePage");
if (btnClearComparePage) {
  btnClearComparePage.addEventListener("click", () => {
    clearAllCompare();
  });
}

function clearAllCompare() {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "Xóa toàn bộ so sánh?",
      text: "Bạn có chắc muốn làm trống danh sách so sánh sản phẩm?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Xóa hết",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        saveCompareList([]);
        updateCompareCounter();
        syncCompareButtonStates();
        renderCompareDock();
        if (document.getElementById("compareTable")) {
          const wrapper = document.querySelector(".compare-table-wrapper");
          const emptyBox = document.getElementById("compareEmpty");
          const headerRight = document.querySelector(".compare-header-right");
          if (wrapper) wrapper.style.display = "none";
          if (headerRight) headerRight.style.display = "none";
          if (emptyBox) emptyBox.style.display = "flex";
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, "/compare");
          }
        }
      }
    });
  } else {
    if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm đang so sánh?")) {
      saveCompareList([]);
      updateCompareCounter();
      syncCompareButtonStates();
      renderCompareDock();
    }
  }
}

// Xử lý trang /compare khi load
function initComparePage() {
  const compareTable = document.getElementById("compareTable");
  const toggleOnlyDiff = document.getElementById("toggleOnlyDiff");

  // Nếu đang ở trang /compare nhưng URL chưa có params `ids`, tự động đồng bộ từ localStorage
  if (window.location.pathname === "/compare" && !window.location.search) {
    const list = getCompareList();
    if (list.length > 0) {
      const ids = list.map((i) => i.id).join(",");
      window.location.replace(`/compare?ids=${ids}`);
      return;
    }
  }

  // Gắn sự kiện cho các nút Xóa cột sản phẩm trên bảng
  if (compareTable) {
    const removeColBtns = compareTable.querySelectorAll(".btn-remove-from-compare");
    removeColBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (id) {
          removeCompareItem(id);
        }
      });
    });

    // Check ban đầu về khác biệt
    checkRowDifferences();
  }

  // Toggle chỉ xem điểm khác biệt
  if (toggleOnlyDiff) {
    toggleOnlyDiff.addEventListener("change", () => {
      checkRowDifferences();
    });
  }
}

// Khởi tạo toàn bộ Wishlist & Compare khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  // Wishlist
  updateWishlistCounter();
  syncWishlistHeartStates();
  renderWishlistPage();

  // Compare
  updateCompareCounter();
  syncCompareButtonStates();
  renderCompareDock();
  initComparePage();
});

