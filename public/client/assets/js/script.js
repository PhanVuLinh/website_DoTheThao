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
  const btnBuyNow = document.getElementById("btnBuyNow") || document.querySelector(".btn-buy-now");

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
        if (spanText) spanText.textContent = "Hết Hàng";
      }
      if (btnBuyNow) {
        btnBuyNow.disabled = true;
        btnBuyNow.classList.add("disabled");
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
        if (spanText) spanText.textContent = "Thêm Vào Giỏ";
      }
      if (btnBuyNow) {
        btnBuyNow.disabled = false;
        btnBuyNow.classList.remove("disabled");
      }
    } else {
      if (stockInfoWrap) stockInfoWrap.style.display = "inline-flex";
      if (lowStockAlert) lowStockAlert.style.display = "none";
      if (btnAddToCart) {
        btnAddToCart.disabled = false;
        btnAddToCart.classList.remove("disabled");
        const spanText = btnAddToCart.querySelector("span");
        if (spanText) spanText.textContent = "Thêm Vào Giỏ";
      }
      if (btnBuyNow) {
        btnBuyNow.disabled = false;
        btnBuyNow.classList.remove("disabled");
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
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "info",
          title: "Đã đạt giới hạn",
          text: `Rất tiếc, size này chỉ còn tối đa ${max} sản phẩm trong kho!`,
          confirmButtonColor: "#ff4722",
        });
      } else {
        alert(`Rất tiếc, size này chỉ còn tối đa ${max} sản phẩm!`);
      }
    }
  });

  btnMinus.addEventListener("click", () => {
    let current = parseInt(qtyInput.value);
    if (current > 1) {
      qtyInput.value = current - 1;
      updateTotalPrice();
    }
  });

  // Xử lý nút Mua Ngay (Fast Checkout)
  if (btnBuyNow) {
    btnBuyNow.addEventListener("click", function (e) {
      e.preventDefault();
      const form = btnBuyNow.closest("form");
      if (!form) return;

      const checkedSize = form.querySelector('input[name="size"]:checked');
      if (!checkedSize) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "warning",
            title: "Chưa chọn kích cỡ",
            text: "Vui lòng chọn kích cỡ (Size) phù hợp trước khi Mua Ngay!",
            confirmButtonColor: "#ff4722",
          });
        } else {
          alert("Vui lòng chọn kích cỡ (Size) trước khi Mua Ngay!");
        }
        return;
      }

      if (parseInt(checkedSize.dataset.stock || 0) <= 0) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "error",
            title: "Tạm hết hàng",
            text: "Kích cỡ bạn chọn hiện đang tạm hết hàng!",
            confirmButtonColor: "#ff4722",
          });
        } else {
          alert("Kích cỡ bạn chọn hiện đang tạm hết hàng!");
        }
        return;
      }

      const buyNowInput = document.getElementById("buyNowInput");
      if (buyNowInput) {
        buyNowInput.value = "true";
      }

      form.submit();
    });
  }

  if (btnAddToCart) {
    btnAddToCart.addEventListener("click", function () {
      const buyNowInput = document.getElementById("buyNowInput");
      if (buyNowInput) {
        buyNowInput.value = "false";
      }
    });
  }
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
   SEARCH DRAWER TOGGLE & LIVE SEARCH AUTOCOMPLETE
   ========================================= */
const searchToggleBtn = document.querySelector(".search-toggle-btn");
const searchDrawer = document.getElementById("headerSearchDrawer");
const searchBackdrop = document.getElementById("headerSearchBackdrop");
const searchCloseBtn = document.getElementById("headerSearchClose");
const searchInput = document.getElementById("headerSearchInput");
const searchClearBtn = document.getElementById("headerSearchClear");
const defaultSuggestions = document.getElementById("defaultSuggestions");
const searchLiveDropdown = document.getElementById("searchLiveDropdown");

if (searchToggleBtn && searchDrawer) {
  const openSearch = () => {
    searchDrawer.classList.add("is-open");
    if (searchBackdrop) searchBackdrop.classList.add("is-open");
    searchToggleBtn.classList.add("is-active");
    if (searchInput) {
      setTimeout(() => {
        searchInput.focus();
        if (searchInput.value.trim().length >= 2) {
          searchInput.dispatchEvent(new Event("input"));
        }
      }, 150);
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

// Live Search Autocomplete Logic
if (searchInput && searchLiveDropdown) {
  let searchDebounceTimer = null;
  let activeAbortController = null;
  let selectedIndex = -1;

  const escapeHtml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return escapeHtml(text);
    const tokens = query
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .map(escapeRegex);
    if (!tokens.length) return escapeHtml(text);
    try {
      const regex = new RegExp(`(${tokens.join("|")})`, "gi");
      const parts = text.split(regex);
      return parts
        .map((part) =>
          regex.test(part)
            ? `<mark class="search-highlight">${escapeHtml(part)}</mark>`
            : escapeHtml(part)
        )
        .join("");
    } catch (e) {
      return escapeHtml(text);
    }
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString("vi-VN") + " đ";
  };

  const resetDropdown = () => {
    searchLiveDropdown.style.display = "none";
    searchLiveDropdown.innerHTML = "";
    if (defaultSuggestions) defaultSuggestions.style.display = "flex";
    selectedIndex = -1;
  };

  const updateClearButton = () => {
    if (searchClearBtn) {
      searchClearBtn.style.display = searchInput.value.trim() ? "inline-flex" : "none";
    }
  };

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      updateClearButton();
      resetDropdown();
      searchInput.focus();
    });
  }

  const renderLoading = () => {
    if (defaultSuggestions) defaultSuggestions.style.display = "none";
    searchLiveDropdown.style.display = "flex";
    searchLiveDropdown.innerHTML = `
      <div class="search-live-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Đang tìm kiếm gợi ý...</span>
      </div>
    `;
  };

  const renderResults = (data, query) => {
    const products = data.products || [];
    const categories = data.categories || [];
    const brands = data.brands || [];
    const totalMatches = data.totalMatches || 0;

    if (defaultSuggestions) defaultSuggestions.style.display = "none";
    searchLiveDropdown.style.display = "flex";

    if (products.length === 0 && categories.length === 0 && brands.length === 0) {
      searchLiveDropdown.innerHTML = `
        <div class="search-live-empty">
          <div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
          <div class="empty-title">Không tìm thấy sản phẩm phù hợp</div>
          <div class="empty-desc">Không có kết quả nào cho từ khóa "<strong>${escapeHtml(query)}</strong>". Hãy thử tìm theo tên thương hiệu như Nike, Mizuno, Puma hoặc danh mục thể thao.</div>
        </div>
      `;
      return;
    }

    let html = "";

    // Gợi ý Danh mục & Thương hiệu liên quan
    if (categories.length > 0 || brands.length > 0) {
      html += `
        <div class="search-live-meta">
          <span class="meta-label">Gợi ý liên quan:</span>
          <div class="meta-tags">
      `;
      categories.forEach((cat) => {
        html += `
          <a href="/category/${escapeHtml(cat.slug)}" class="meta-tag">
            <i class="fa-regular fa-folder-open"></i>
            <span>${escapeHtml(cat.title)}</span>
          </a>
        `;
      });
      brands.forEach((brand) => {
        html += `
          <a href="/search?keyword=${encodeURIComponent(brand)}" class="meta-tag">
            <i class="fa-solid fa-tag"></i>
            <span>${escapeHtml(brand)}</span>
          </a>
        `;
      });
      html += `
          </div>
        </div>
      `;
    }

    // Danh sách 5 sản phẩm khớp nhất
    if (products.length > 0) {
      html += `
        <div class="search-live-products">
          <div class="live-products-heading">
            <span>Sản phẩm gợi ý</span>
            <span class="count-badge">${products.length} / ${totalMatches}</span>
          </div>
          <div class="live-products-list">
      `;

      products.forEach((p, index) => {
        const thumbUrl = p.thumbnail || "https://placehold.co/100x100/f1f5f9/94a3b8?text=SP";
        html += `
          <a href="/product/detail/${escapeHtml(p.slug)}" class="live-product-item" data-index="${index}">
            <div class="item-thumb">
              <img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(p.title)}" onerror="this.src='https://placehold.co/100x100/f1f5f9/94a3b8?text=SP'" />
              ${p.discountPercentage > 0 ? `<span class="item-badge-sale">-${p.discountPercentage}%</span>` : ""}
            </div>
            <div class="item-body">
              <div class="item-title">${highlightMatch(p.title, query)}</div>
              <div class="item-meta">
                ${p.brand ? `<span class="item-brand"><i class="fa-solid fa-certificate"></i> ${escapeHtml(p.brand)}</span>` : ""}
              </div>
              <div class="item-pricing">
                <span class="item-price-new">${formatPrice(p.priceNew)}</span>
                ${p.discountPercentage > 0 ? `<span class="item-price-old">${formatPrice(p.price)}</span>` : ""}
              </div>
            </div>
            <div class="item-arrow">
              <i class="fa-solid fa-chevron-right"></i>
            </div>
          </a>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    // Nút xem tất cả kết quả
    html += `
      <a href="/search?keyword=${encodeURIComponent(query)}" class="search-live-view-all">
        <span>Xem tất cả <strong>${totalMatches}</strong> kết quả cho "<strong>${escapeHtml(query)}</strong>"</span>
        <i class="fa-solid fa-arrow-right"></i>
      </a>
    `;

    searchLiveDropdown.innerHTML = html;
    selectedIndex = -1;
  };

  const fetchSuggestions = async (query) => {
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    renderLoading();

    try {
      const response = await fetch(`/search/suggest?keyword=${encodeURIComponent(query)}`, {
        signal: activeAbortController.signal,
      });
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();

      if (searchInput.value.trim().toLowerCase() === query.toLowerCase()) {
        renderResults(data, query);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Live search fetch error:", err);
        searchLiveDropdown.innerHTML = `
          <div class="search-live-empty">
            <div class="empty-title">Không thể tải gợi ý</div>
            <div class="empty-desc">Vui lòng thử lại hoặc nhấn Enter để tìm kiếm đầy đủ.</div>
          </div>
        `;
      }
    }
  };

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    updateClearButton();

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (query.length < 2) {
      if (activeAbortController) activeAbortController.abort();
      resetDropdown();
      return;
    }

    searchDebounceTimer = setTimeout(() => {
      fetchSuggestions(query);
    }, 220);
  });

  const updateActiveItem = (items) => {
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add("is-selected");
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        item.classList.remove("is-selected");
      }
    });
  };

  searchInput.addEventListener("keydown", (e) => {
    const items = searchLiveDropdown.querySelectorAll(".live-product-item");
    if (!items.length || searchLiveDropdown.style.display === "none") return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateActiveItem(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    } else if (e.key === "Enter" && selectedIndex >= 0 && items[selectedIndex]) {
      e.preventDefault();
      items[selectedIndex].click();
    }
  });

  // Initial check on load
  updateClearButton();
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

  const voucherCodeChips = document.querySelectorAll(".voucher-card__code-chip");
  voucherCodeChips.forEach((chip) => {
    chip.addEventListener("click", function () {
      const card = this.closest(".voucher-card");
      if (card) {
        const copyBtn = card.querySelector(".btn-copy-voucher");
        if (copyBtn) copyBtn.click();
      }
    });
  });
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
  const drawerCounterEl = document.getElementById("wishlist-drawer-counter");
  const list = getWishlist();
  const count = list.length;

  if (counterEl) {
    if (count > 0) {
      counterEl.textContent = count;
      counterEl.style.display = "inline-flex";
    } else {
      counterEl.style.display = "none";
    }
  }

  if (drawerCounterEl) {
    if (count > 0) {
      drawerCounterEl.textContent = count;
      drawerCounterEl.style.display = "inline-flex";
    } else {
      drawerCounterEl.style.display = "none";
    }
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
  const drawerCounterEl = document.getElementById("compare-drawer-counter");
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

  if (drawerCounterEl) {
    if (count > 0) {
      drawerCounterEl.textContent = count;
      drawerCounterEl.style.display = "inline-flex";
    } else {
      drawerCounterEl.style.display = "none";
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
    document.body.classList.remove("has-compare-dock", "dock-collapsed");
    return;
  }

  // Hiển thị thanh dock
  dockEl.style.display = "block";
  document.body.classList.add("has-compare-dock");
  if (dockEl.classList.contains("is-collapsed")) {
    document.body.classList.add("dock-collapsed");
  } else {
    document.body.classList.remove("dock-collapsed");
  }
  updateCompareCounter();

  // Cập nhật trạng thái và link so sánh
  if (btnDockCompare) {
    if (list.length >= 2) {
      const idsQuery = list.map((item) => item.id).join(",");
      btnDockCompare.href = `/compare?ids=${idsQuery}`;
      btnDockCompare.classList.remove("is-disabled");
      btnDockCompare.title = `So sánh chi tiết ${list.length} sản phẩm đã chọn`;
      btnDockCompare.innerHTML = `<i class="fa-solid fa-scale-balanced"></i><span>So Sánh Ngay (${list.length})</span>`;
    } else {
      btnDockCompare.href = "javascript:void(0);";
      btnDockCompare.classList.add("is-disabled");
      btnDockCompare.title = "Vui lòng chọn thêm ít nhất 1 sản phẩm để bắt đầu so sánh";
      btnDockCompare.innerHTML = `<i class="fa-solid fa-scale-balanced"></i><span>Chọn thêm 1 SP</span>`;
    }
  }

  // Render các slot sản phẩm đã chọn
  let slotsHtml = "";
  list.forEach((item) => {
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
  });

  // Nếu còn chỗ trống (< MAX_COMPARE), hiển thị 1 slot compact mời chọn thêm
  if (list.length < MAX_COMPARE) {
    const remaining = MAX_COMPARE - list.length;
    slotsHtml += `
      <div class="dock-slot dock-slot--empty" title="Bạn có thể thêm tối đa ${remaining} sản phẩm nữa vào danh sách so sánh">
        <i class="fa-solid fa-plus"></i>
        <span>Thêm SP (${remaining})</span>
      </div>
    `;
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
    if (compareDock.classList.contains("is-collapsed")) {
      document.body.classList.add("dock-collapsed");
    } else {
      document.body.classList.remove("dock-collapsed");
    }
  });
}

if (btnCloseCompareDock && compareDock) {
  btnCloseCompareDock.addEventListener("click", () => {
    compareDock.style.display = "none";
    document.body.classList.remove("has-compare-dock", "dock-collapsed");
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

// =========================================================
// PRODUCT MULTI-CRITERIA FILTER & MOBILE DRAWER SYSTEM
// =========================================================
function initProductFilterSystem() {
  // 1. Sắp xếp sản phẩm tự động khi chọn dropdown (Sort Select)
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      const url = new URL(window.location.href);
      if (this.value) {
        url.searchParams.set("sort", this.value);
      } else {
        url.searchParams.delete("sort");
      }
      url.searchParams.set("page", "1");
      window.location.href = url.href;
    });
  }

  // 2. Gỡ từng tag bộ lọc đang chọn (Active Filter Pills Dismiss)
  const removePillBtns = document.querySelectorAll(".active-filters-bar .btn-remove-pill");
  removePillBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const key = this.getAttribute("data-key");
      const val = this.getAttribute("data-val");
      const url = new URL(window.location.href);

      if (key === "brand" || key === "size") {
        const allVals = url.searchParams.getAll(key);
        const filtered = allVals.filter((v) => String(v).trim() !== String(val).trim());
        url.searchParams.delete(key);
        filtered.forEach((v) => url.searchParams.append(key, v));
      } else if (key === "price") {
        url.searchParams.delete("price");
      } else if (key === "priceCustom") {
        url.searchParams.delete("priceMin");
        url.searchParams.delete("priceMax");
      } else if (key === "inStock") {
        url.searchParams.delete("inStock");
      }

      url.searchParams.set("page", "1");
      window.location.href = url.href;
    });
  });

  // 3. Mobile Filter Drawer Open / Close
  const btnOpenFilterMobile = document.getElementById("btnOpenFilterMobile");
  const btnCloseFilterMobile = document.getElementById("btnCloseFilterMobile");
  const filterDrawerBackdrop = document.getElementById("filterDrawerBackdrop");
  const filterSidebar = document.getElementById("productFilterSidebar");

  const openDrawer = () => {
    if (filterSidebar) filterSidebar.classList.add("is-open");
    if (filterDrawerBackdrop) filterDrawerBackdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    if (filterSidebar) filterSidebar.classList.remove("is-open");
    if (filterDrawerBackdrop) filterDrawerBackdrop.classList.remove("is-open");
    document.body.style.overflow = "auto";
  };

  if (btnOpenFilterMobile) {
    btnOpenFilterMobile.addEventListener("click", openDrawer);
  }
  if (btnCloseFilterMobile) {
    btnCloseFilterMobile.addEventListener("click", closeDrawer);
  }
  if (filterDrawerBackdrop) {
    filterDrawerBackdrop.addEventListener("click", closeDrawer);
  }

  // 4. Toggle active highlight trên các checkbox size pill
  const sizePills = document.querySelectorAll(".size-checkbox-pill");
  sizePills.forEach((label) => {
    const input = label.querySelector("input[type='checkbox']");
    if (input) {
      input.addEventListener("change", () => {
        if (input.checked) {
          label.classList.add("active");
        } else {
          label.classList.remove("active");
        }
      });
    }
  });
}

// Khởi tạo toàn bộ Wishlist, Compare & Filter khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  // Hero Carousel
  initHeroCarousel();

  // Wishlist
  updateWishlistCounter();
  syncWishlistHeartStates();
  renderWishlistPage();

  // Compare
  updateCompareCounter();
  syncCompareButtonStates();
  renderCompareDock();
  initComparePage();

  // Multi-Criteria Filter
  initProductFilterSystem();

  // Review System Interactive
  initReviewInteractive();
});

/* =========================================
   HERO CAROUSEL SLIDER (HOMEPAGE)
   ========================================= */
function initHeroCarousel() {
  const heroSwiperEl = document.querySelector(".hero-swiper");
  if (!heroSwiperEl || typeof Swiper === "undefined") return;

  new Swiper(".hero-swiper", {
    loop: true,
    speed: 900,
    autoplay: {
      delay: 5500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    pagination: {
      el: ".hero-swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".hero-nav-arrow--next",
      prevEl: ".hero-nav-arrow--prev",
    },
  });
}

/* =========================================
   PRODUCT REVIEW FORM INTERACTIVE HELPERS
   ========================================= */
function initReviewInteractive() {
  // Star rating hint updates
  const ratingInputs = document.querySelectorAll('input[name="rating"]');
  const ratingHint = document.getElementById("ratingHint");
  const ratingTexts = {
    "5": "Tuyệt vời (5/5 sao)",
    "4": "Rất tốt (4/5 sao)",
    "3": "Bình thường (3/5 sao)",
    "2": "Kém (2/5 sao)",
    "1": "Rất tệ (1/5 sao)",
  };

  if (ratingInputs.length > 0 && ratingHint) {
    ratingInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked && ratingTexts[input.value]) {
          ratingHint.textContent = ratingTexts[input.value];
        }
      });
    });
  }

  // File upload preview
  const fileInput = document.getElementById("reviewImages");
  const previewContainer = document.getElementById("reviewImagesPreview");
  const dropzoneText = document.getElementById("dropzoneText");

  if (fileInput && previewContainer) {
    fileInput.addEventListener("change", function () {
      previewContainer.innerHTML = "";
      const files = Array.from(this.files || []);

      if (files.length > 3) {
        alert("Bạn chỉ có thể tải lên tối đa 3 ảnh thực tế!");
        this.value = "";
        if (dropzoneText) dropzoneText.textContent = "Nhấn để chọn ảnh từ thiết bị";
        return;
      }

      if (files.length === 0) {
        if (dropzoneText) dropzoneText.textContent = "Nhấn để chọn ảnh từ thiết bị";
        return;
      }

      if (dropzoneText) {
        dropzoneText.textContent = `Đã chọn ${files.length} ảnh thực tế`;
      }

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const item = document.createElement("div");
          item.className = "preview-img-item";
          item.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
          previewContainer.appendChild(item);
        };
        reader.readAsDataURL(file);
      });
    });
  }
}

/* ==========================================================================
   SPORTS HUB PILL TABS INTERACTION & CATEGORY FILTERING
   ========================================================================== */
function initSportsHubTabs() {
  const hubSection = document.getElementById("sportsHubSection");
  if (!hubSection) return;

  const pillButtons = hubSection.querySelectorAll(".sport-pill-btn");
  const heroCards = hubSection.querySelectorAll(".sport-hero-card");
  const categoryCards = hubSection.querySelectorAll(".sport-category-card");
  const countDisplay = document.getElementById("subcatsCountDisplay");

  pillButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedSport = btn.getAttribute("data-sport") || "all";

      // Toggle active state on buttons
      pillButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Filter Hero Cards
      heroCards.forEach((card) => {
        const cardSport = card.getAttribute("data-sport");
        if (selectedSport === "all" || cardSport === selectedSport) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });

      // Filter Subcategory Cards
      let visibleCount = 0;
      categoryCards.forEach((cat) => {
        const catSport = cat.getAttribute("data-sport");
        if (selectedSport === "all" || catSport === selectedSport) {
          cat.classList.remove("is-hidden");
          visibleCount++;
        } else {
          cat.classList.add("is-hidden");
        }
      });

      // Update count badge
      if (countDisplay) {
        countDisplay.textContent = `${visibleCount} danh mục`;
      }
    });
  });
}

// ====================================================================
// 24. TITISPORT PRO ARENA THEME (CYBER SPORT DARK MODE)
// ====================================================================
function initProArenaTheme() {
  const THEME_KEY = "titisport_pro_arena_theme";
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";

  function applyTheme(theme) {
    const isDark = theme === "dark";
    if (isDark) {
      document.body.classList.add("pro-arena-mode");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.body.classList.remove("pro-arena-mode");
      document.documentElement.removeAttribute("data-theme");
    }

    // Update icons
    const themeBtns = document.querySelectorAll("#btnThemeToggle, .theme-toggle-btn");
    themeBtns.forEach((btn) => {
      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
      }
    });

    const mobileStatus = document.getElementById("mobileThemeStatus");
    if (mobileStatus) {
      mobileStatus.textContent = isDark ? "BẬT" : "TẮT";
      mobileStatus.style.color = isDark ? "#38bdf8" : "#64748b";
    }
  }

  // Apply immediately on initialization
  applyTheme(savedTheme);

  // Toggle handlers
  document.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest("#btnThemeToggle, .theme-toggle-btn, #btnMobileToggleTheme");
    if (toggleBtn) {
      e.preventDefault();
      const currentTheme = document.body.classList.contains("pro-arena-mode") ? "dark" : "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, newTheme);
      applyTheme(newTheme);

      // Flash feedback message
      if (window.Swal) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: newTheme === "dark" ? "Đã bật Chế độ Sân Đấu Pro Arena" : "Đã chuyển sang Chế độ Tiêu chuẩn",
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true,
        });
      }
    }
  });
}

// ====================================================================
// 25. TITISPORT AI SPORT LAB (HỆ THỐNG TƯ VẤN THỂ THAO AI CHUYÊN NGHIỆP)
// ====================================================================
function initAiSportLab() {
  const modal = document.getElementById("aiSportLabModal");
  if (!modal) return;

  const backdrop = document.getElementById("aiLabBackdrop");
  const btnClose = document.getElementById("btnAiLabClose");
  const btnCloseFinished = document.getElementById("btnAiCloseFinished");
  const btnRestart = document.getElementById("btnAiRestart");

  const initialCard = modal.querySelector(".ai-sport-card.is-selected") || modal.querySelector(".ai-sport-card");
  let selectedSport = initialCard ? (initialCard.getAttribute("data-sport") || "badminton") : "badminton";

  function openLab() {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const currentActiveCard = modal.querySelector(".ai-sport-card.is-selected") || modal.querySelector(".ai-sport-card");
    if (currentActiveCard) {
      selectedSport = currentActiveCard.getAttribute("data-sport") || "badminton";
    }
    goToStep(1);
  }

  function closeLab() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function updateStepsBar(step) {
    const stepItems = modal.querySelectorAll(".ai-step-item");
    stepItems.forEach((item) => {
      const s = parseInt(item.getAttribute("data-step"));
      item.classList.remove("is-active", "is-finished");
      if (s === step) {
        item.classList.add("is-active");
      } else if (s < step) {
        item.classList.add("is-finished");
      }
    });
  }

  function goToStep(step) {
    currentStep = step;
    const views = modal.querySelectorAll(".ai-view-step");
    views.forEach((v) => v.classList.remove("is-active"));

    if (step === 1) {
      document.getElementById("aiStep1").classList.add("is-active");
      updateStepsBar(1);
    } else if (step === 2) {
      document.getElementById("aiStep2").classList.add("is-active");
      updateStepsBar(2);
    } else if (step === "loading") {
      document.getElementById("aiStepLoading").classList.add("is-active");
      updateStepsBar(3);
    } else if (step === 3) {
      document.getElementById("aiStep3").classList.add("is-active");
      updateStepsBar(3);
    }
  }

  // Open triggers
  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("#btnHeaderOpenAiLab, #btnFloatingOpenAiLab, #btnMobileOpenAiLab, .btn-open-ai-lab");
    if (openBtn) {
      e.preventDefault();
      openLab();
    }
  });

  if (btnClose) btnClose.addEventListener("click", closeLab);
  if (btnCloseFinished) btnCloseFinished.addEventListener("click", closeLab);
  if (backdrop) backdrop.addEventListener("click", closeLab);

  // Esc key close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      closeLab();
    }
  });

  // Step 1: Select Sport Card
  const sportCards = modal.querySelectorAll(".ai-sport-card");
  sportCards.forEach((card) => {
    card.addEventListener("click", () => {
      sportCards.forEach((c) => c.classList.remove("is-selected"));
      card.classList.add("is-selected");
      selectedSport = card.getAttribute("data-sport") || "badminton";
    });
  });

  // Next from Step 1 to Step 2
  const btnNextTo2 = document.getElementById("btnAiNextTo2");
  if (btnNextTo2) {
    btnNextTo2.addEventListener("click", () => goToStep(2));
  }

  // Back from Step 2 to Step 1
  const btnBackTo1 = document.getElementById("btnAiBackTo1");
  if (btnBackTo1) {
    btnBackTo1.addEventListener("click", () => goToStep(1));
  }

  // Restart from Step 3 to Step 1
  if (btnRestart) {
    btnRestart.addEventListener("click", () => goToStep(1));
  }

  // Start AI Analysis from Step 2
  const btnStartAnalyze = document.getElementById("btnAiStartAnalyze");
  if (btnStartAnalyze) {
    btnStartAnalyze.addEventListener("click", async () => {
      const playstyleEl = modal.querySelector('input[name="aiPlaystyle"]:checked');
      const wristEl = modal.querySelector('input[name="aiWrist"]:checked');
      const budgetEl = modal.querySelector('input[name="aiBudget"]:checked');

      const playstyle = playstyleEl ? playstyleEl.value : "attack";
      const wristStrength = wristEl ? wristEl.value : "beginner";
      const budget = budgetEl ? budgetEl.value : "1m-to-2.5m";

      goToStep("loading");

      try {
        const queryParams = new URLSearchParams({
          sport: selectedSport,
          playstyle: playstyle,
          wristStrength: wristStrength,
          budget: budget,
        });

        const res = await fetch(`/product/api/ai-recommend?${queryParams.toString()}`);
        const data = await res.json();

        // Giữ loading 1.2s để tạo hiệu ứng phân tích radar AI ấn tượng
        setTimeout(() => {
          if (data && data.code === 200) {
            renderAiResults(data.specs, data.products);
          } else {
            renderAiFallbackResults(selectedSport, playstyle, wristStrength);
          }
          goToStep(3);
        }, 1200);
      } catch (err) {
        console.error("AI Lab Fetch Error:", err);
        setTimeout(() => {
          renderAiFallbackResults(selectedSport, playstyle, wristStrength);
          goToStep(3);
        }, 1000);
      }
    });
  }

  function renderAiResults(specs, products) {
    const board = document.getElementById("aiSpecRadarBoard");
    if (board && specs) {
      let specItemsHtml = "";
      if (specs.sportTitle) {
        specItemsHtml += `
          <div class="ai-spec-item" style="grid-column: 1 / -1; background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.2);">
            <span class="spec-label"><i class="fa-solid fa-trophy" style="color: #6366f1; margin-right: 6px;"></i>Bộ Môn Đang Khảo Sát:</span>
            <strong class="spec-value" style="color: #4f46e5; font-size: 15px;">${specs.sportTitle}</strong>
          </div>`;
      }
      if (specs.balancePoint) {
        specItemsHtml += `
          <div class="ai-spec-item">
            <span class="spec-label">Điểm Cân Bằng Lý Tưởng:</span>
            <span class="spec-value">${specs.balancePoint}</span>
          </div>`;
      }
      if (specs.shaftFlex) {
        specItemsHtml += `
          <div class="ai-spec-item">
            <span class="spec-label">Độ Cứng Đũa Vợt Khuyên Dùng:</span>
            <span class="spec-value">${specs.shaftFlex}</span>
          </div>`;
      }
      if (specs.weightRacket) {
        specItemsHtml += `
          <div class="ai-spec-item">
            <span class="spec-label">Trọng Lượng Tối Ưu Lực Tay:</span>
            <span class="spec-value">${specs.weightRacket}</span>
          </div>`;
      }
      if (specs.recommendedTension) {
        specItemsHtml += `
          <div class="ai-spec-item">
            <span class="spec-label">Mức Căng Cước Đề Xuất:</span>
            <span class="spec-value">${specs.recommendedTension}</span>
          </div>`;
      }
      if (specs.soleType) {
        specItemsHtml += `
          <div class="ai-spec-item">
            <span class="spec-label">Bộ Đế Giày Khuyên Dùng:</span>
            <span class="spec-value">${specs.soleType}</span>
          </div>`;
      }
      if (specs.upperMaterial) {
        specItemsHtml += `
          <div class="ai-spec-item">
            <span class="spec-label">Chất Liệu Thân Giày:</span>
            <span class="spec-value">${specs.upperMaterial}</span>
          </div>`;
      }
      if (specs.cushionTech) {
        specItemsHtml += `
          <div class="ai-spec-item">
            <span class="spec-label">Công Nghệ Giảm Chấn:</span>
            <span class="spec-value">${specs.cushionTech}</span>
          </div>`;
      }
      if (specs.supportSystem) {
        specItemsHtml += `
          <div class="ai-spec-item">
            <span class="spec-label">Hệ Thống Ổn Định Khớp:</span>
            <span class="spec-value">${specs.supportSystem}</span>
          </div>`;
      }
      if (specs.fitType) {
        specItemsHtml += `
          <div class="ai-spec-item">
            <span class="spec-label">Form Dáng / Thiết Kế:</span>
            <span class="spec-value">${specs.fitType}</span>
          </div>`;
      }

      board.innerHTML = `
        <div class="ai-specs-grid">${specItemsHtml}</div>
        <div class="ai-spec-summary">
          <i class="fa-solid fa-lightbulb" style="color: #f59e0b; margin-right: 6px;"></i>
          <strong>Đánh giá của AI:</strong> ${specs.playstyleDesc || "Cấu hình được tối ưu hóa cho phong cách thi đấu và khả năng xoay xở của bạn."}
        </div>
      `;
    }

    const grid = document.getElementById("aiProductsResultGrid");
    if (grid) {
      if (!products || products.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: #64748b;">
            <i class="fa-solid fa-box-open" style="font-size: 32px; margin-bottom: 8px;"></i>
            <p>Đang đối chiếu sản phẩm với kho hàng. Vui lòng thử lại với mức ngân sách khác.</p>
          </div>`;
        return;
      }

      grid.innerHTML = products.map((item) => `
        <div class="ai-result-card">
          <span class="ai-match-badge">${item.matchScore}% PHÙ HỢP</span>
          <a class="ai-result-thumb" href="/product/detail/${item.slug}">
            <img src="${item.thumbnail || 'https://placehold.co/300x300/f8fafc/94a3b8?text=TITISPORT'}" alt="${item.title}" loading="lazy" />
          </a>
          <span class="ai-result-brand">${item.brand || 'CHÍNH HÃNG'}</span>
          <h5 class="ai-result-title" title="${item.title}">${item.title}</h5>
          <div class="ai-result-price-row">
            <span class="ai-result-price-new">${Number(item.priceNew || item.price).toLocaleString('vi-VN')}đ</span>
            ${item.discountPercentage > 0 ? `<span class="ai-result-price-old">${Number(item.price).toLocaleString('vi-VN')}đ</span>` : ''}
          </div>
          <div class="ai-result-actions">
            <button type="button" class="btn-ai-card-cart btn-cart" data-id="${item.id}" data-slug="${item.slug}">
              <i class="fa-solid fa-cart-shopping"></i> Thêm giỏ
            </button>
            <button type="button" class="btn-ai-card-compare btn-compare-toggle" data-id="${item.id}" data-title="${item.title}" data-slug="${item.slug}" data-price="${item.priceNew || item.price}" data-thumbnail="${item.thumbnail || ''}" data-brand="${item.brand || 'CHÍNH HÃNG'}">
              <i class="fa-solid fa-code-compare"></i> So sánh
            </button>
          </div>
        </div>
      `).join("");
    }
  }

  function renderAiFallbackResults(sport, playstyle, wrist) {
    const specs = {
      balancePoint: "295 - 302 mm (Hơi nặng đầu / Tấn công linh hoạt)",
      shaftFlex: "Trung bình (Medium Flex) - Trợ lực tốt",
      weightRacket: "4U (83g) - Dễ làm quen & thuần thục",
      recommendedTension: "10.5 - 11.0 kg (23-24 lbs)",
      playstyleDesc: "Phù hợp với các pha đánh cầu nhanh, tạo góc smash gắt đồng thời vẫn giữ khả năng phòng thủ phản tạt chuẩn xác.",
    };
    renderAiResults(specs, []);
  }
}

// ====================================================================
// 26. QUICK VIEW STUDIO MODAL (XEM NHANH SẢN PHẨM 1 CHẠM SIÊU TỐC)
// ====================================================================
function initQuickViewStudio() {
  const modal = document.getElementById("quickViewModal");
  if (!modal) return;

  const backdrop = document.getElementById("quickViewBackdrop");
  const btnClose = document.getElementById("btnQuickViewClose");

  const imgMain = document.getElementById("quickViewMainImg");
  const thumbsWrap = document.getElementById("quickViewThumbs");
  const badgeDiscount = document.getElementById("quickViewDiscountBadge");
  const elBrand = document.getElementById("quickViewBrand");
  const elTitle = document.getElementById("quickViewTitle");
  const elPriceNew = document.getElementById("quickViewPriceNew");
  const elPriceOld = document.getElementById("quickViewPriceOld");
  const elSavings = document.getElementById("quickViewSavings");
  const sizesWrap = document.getElementById("quickViewSizesWrap");
  const sizesList = document.getElementById("quickViewSizesList");
  const selectedSizeVal = document.getElementById("quickViewSelectedSizeVal");
  const qtyInput = document.getElementById("quickViewQtyInput");
  const btnQtyMinus = document.getElementById("btnQuickQtyMinus");
  const btnQtyPlus = document.getElementById("btnQuickQtyPlus");
  const btnAddCart = document.getElementById("btnQuickAddToCart");
  const btnBuyNow = document.getElementById("btnQuickBuyNow");
  const fullDetailLink = document.getElementById("quickViewFullDetailLink");

  let currentProduct = null;
  let selectedSize = null;

  function openQuickView(slug) {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    fetchQuickProduct(slug);
  }

  function closeQuickView() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    currentProduct = null;
    selectedSize = null;
  }

  if (btnClose) btnClose.addEventListener("click", closeQuickView);
  if (backdrop) backdrop.addEventListener("click", closeQuickView);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      closeQuickView();
    }
  });

  // Quantity handlers
  if (btnQtyMinus) {
    btnQtyMinus.addEventListener("click", () => {
      let v = parseInt(qtyInput.value) || 1;
      if (v > 1) qtyInput.value = v - 1;
    });
  }

  if (btnQtyPlus) {
    btnQtyPlus.addEventListener("click", () => {
      let v = parseInt(qtyInput.value) || 1;
      if (v < 99) qtyInput.value = v + 1;
    });
  }

  // Global listener for Quick View triggers on cards
  document.addEventListener("click", (e) => {
    const quickBtn = e.target.closest(".quick-view-btn, .quick-view-pill, .btn-quick-view");
    if (quickBtn) {
      e.preventDefault();
      e.stopPropagation();
      const slug = quickBtn.getAttribute("data-slug");
      if (slug) {
        openQuickView(slug);
      }
    }
  });

  async function fetchQuickProduct(slug) {
    // Show placeholder loading state
    elTitle.textContent = "Đang tải dữ liệu sản phẩm...";
    elBrand.textContent = "TITISPORT";
    elPriceNew.textContent = "...";
    imgMain.src = "https://placehold.co/400x400/f8fafc/94a3b8?text=TITISPORT";
    thumbsWrap.innerHTML = "";
    sizesWrap.style.display = "none";
    qtyInput.value = "1";

    try {
      const res = await fetch(`/product/api/quick-detail/${slug}`);
      const data = await res.json();

      if (data && data.code === 200 && data.product) {
        currentProduct = data.product;
        populateModal(currentProduct);
      } else {
        elTitle.textContent = "Không tìm thấy thông tin sản phẩm";
      }
    } catch (err) {
      console.error("Error fetching quick detail:", err);
      elTitle.textContent = "Lỗi khi tải thông tin sản phẩm";
    }
  }

  function populateModal(prod) {
    elBrand.textContent = prod.brand || "CHÍNH HÃNG 100%";
    elTitle.textContent = prod.title;

    // Price
    const priceNewFormatted = Number(prod.priceNew || prod.price).toLocaleString("vi-VN") + "đ";
    elPriceNew.textContent = priceNewFormatted;

    if (prod.discountPercentage > 0) {
      elPriceOld.style.display = "inline";
      elPriceOld.textContent = Number(prod.price).toLocaleString("vi-VN") + "đ";

      const diff = prod.price - (prod.priceNew || prod.price);
      elSavings.style.display = "inline-flex";
      elSavings.textContent = `Tiết kiệm ${Number(diff).toLocaleString("vi-VN")}đ`;

      badgeDiscount.style.display = "block";
      badgeDiscount.textContent = `-${prod.discountPercentage}%`;
    } else {
      elPriceOld.style.display = "none";
      elSavings.style.display = "none";
      badgeDiscount.style.display = "none";
    }

    // Images
    const images = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.thumbnail];
    imgMain.src = images[0] || "https://placehold.co/400x400/f8fafc/94a3b8?text=TITISPORT";

    thumbsWrap.innerHTML = images.map((src, idx) => `
      <div class="quick-thumb-item ${idx === 0 ? 'is-active' : ''}" data-src="${src}">
        <img src="${src}" alt="Thumb ${idx + 1}" />
      </div>
    `).join("");

    // Thumbnail switch listener
    const thumbItems = thumbsWrap.querySelectorAll(".quick-thumb-item");
    thumbItems.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbItems.forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
        imgMain.src = thumb.getAttribute("data-src");
      });
    });

    // Sizes
    if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
      sizesWrap.style.display = "block";
      selectedSize = prod.sizes[0].name || prod.sizes[0].size || prod.sizes[0];
      selectedSizeVal.textContent = selectedSize;

      sizesList.innerHTML = prod.sizes.map((s, idx) => {
        const val = typeof s === "object" ? (s.name || s.size) : s;
        return `<button type="button" class="quick-size-btn ${idx === 0 ? 'is-active' : ''}" data-val="${val}">${val}</button>`;
      }).join("");

      const sizeBtns = sizesList.querySelectorAll(".quick-size-btn");
      sizeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          sizeBtns.forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          selectedSize = btn.getAttribute("data-val");
          selectedSizeVal.textContent = selectedSize;
        });
      });
    } else {
      sizesWrap.style.display = "none";
      selectedSize = null;
    }

    // Full detail link
    fullDetailLink.href = `/product/detail/${prod.slug}`;
  }

  // Quick Add To Cart
  if (btnAddCart) {
    btnAddCart.addEventListener("click", async () => {
      if (!currentProduct) return;
      const quantity = parseInt(qtyInput.value) || 1;

      try {
        const res = await fetch(`/cart/add/${currentProduct.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: quantity,
            size: selectedSize || "",
          }),
        });

        if (window.Swal) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `Đã thêm ${quantity} x "${currentProduct.title}" vào giỏ!`,
            showConfirmButton: false,
            timer: 2000,
          });
        }

        // Trigger Parabolic Flying Animation from modal image to cart
        if (typeof triggerFlyingItem === "function" && imgMain) {
          triggerFlyingItem(imgMain, ".cart-action-btn");
        }

        closeQuickView();
      } catch (err) {
        console.error("Quick Add Cart Error:", err);
        window.location.href = `/product/detail/${currentProduct.slug}`;
      }
    });
  }

  // Quick Buy Now
  if (btnBuyNow) {
    btnBuyNow.addEventListener("click", async () => {
      if (!currentProduct) return;
      const quantity = parseInt(qtyInput.value) || 1;

      try {
        await fetch(`/cart/add/${currentProduct.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: quantity,
            size: selectedSize || "",
          }),
        });
        window.location.href = "/cart";
      } catch (err) {
        window.location.href = `/product/detail/${currentProduct.slug}`;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSportsHubTabs();
  initProArenaTheme();
  initAiSportLab();
  initQuickViewStudio();
});

