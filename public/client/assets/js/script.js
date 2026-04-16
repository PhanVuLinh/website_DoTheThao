// ==========================================
// 1. CÁC HÀM TIỆN ÍCH (Global Functions)
// ==========================================
function changeImage(element) {
  const newSrc = element.src;
  const mainImage = document.getElementById("main-image");
  if (mainImage) mainImage.src = newSrc;

  const thumbs = document.querySelectorAll(".gallery-thumbs img");
  thumbs.forEach((thumb) => thumb.classList.remove("active"));

  element.classList.add("active");
}

// ==========================================
//  CÁC CHỨC NĂNG
// ==========================================
// --- SECTION 1: ACTIVE HEADER MENU ---
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
          if (parentLink) {
            parentLink.classList.add("active");
          }
        }
      }
    }
  });
}

// --- SECTION 2: SLIDER PROMO (AUTO-PLAY) ---
const track = document.getElementById("promo-track");
const dots = document.querySelectorAll("#promo-dots .dot");

if (track && dots.length > 0) {
  let currentIndex = 0;
  let autoplayInterval;

  const slideTo = (index) => {
    const itemWidth = track.children[0].getBoundingClientRect().width;
    const gap = 30;
    const moveDistance = (itemWidth + gap) * index;

    track.style.transform = `translateX(-${moveDistance}px)`;

    dots.forEach((dot) => dot.classList.remove("active"));
    dots[index].classList.add("active");
    currentIndex = index;
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const clickedIndex = parseInt(e.target.getAttribute("data-index"));
      slideTo(clickedIndex);
      resetAutoplay();
    });
  });

  const startAutoplay = () => {
    autoplayInterval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % dots.length;
      slideTo(nextIndex);
    }, 4000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayInterval);
    startAutoplay();
  };

  startAutoplay();
}

// --- SECTION 3: MOBILE MENU & ACCORDION ---
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

// Xổ menu con trên mobile
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

// --- SECTION 4: SLIDER FLASH DEALS ---
const flashList = document.querySelector(".flash-products-list");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

if (flashList && prevBtn && nextBtn) {
  nextBtn.addEventListener("click", () => {
    const itemWidth =
      flashList.querySelector(".flash-product-item").offsetWidth + 20;
    flashList.scrollBy({ left: itemWidth, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    const itemWidth =
      flashList.querySelector(".flash-product-item").offsetWidth + 20;
    flashList.scrollBy({ left: -itemWidth, behavior: "smooth" });
  });
}

// --- SECTION 5: SWEET ALERT FLASH MESSAGE ---
const alertItems = document.querySelectorAll("[data-alert]");
if (alertItems.length > 0) {
  if (typeof Swal !== "undefined") {
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
  } else {
    console.warn(
      "Cảnh báo: Không tìm thấy thư viện SweetAlert2, thông báo không thể hiển thị.",
    );
  }
}
// ==========================================
// KHỞI TẠO SWIPER CHO CHI TIẾT SẢN PHẨM
// ==========================================

// 1. Slider ảnh nhỏ (Thumbs)
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

// 2. Slider ảnh lớn (Main) đồng bộ với Thumbs
const swiperMain = new Swiper(".main-swiper", {
  spaceBetween: 10,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  thumbs: {
    swiper: swiperThumbs,
  },
});

const qtyInput = document.getElementById("quantity");
const stockDisplay = document.getElementById("current-stock");
const btnPlus = document.querySelector(".btn-qty-custom.plus");
const btnMinus = document.querySelector(".btn-qty-custom.minus");
const sizeInputs = document.querySelectorAll('input[name="size"]');

const priceWrap = document.querySelector(".price-wrap");
const priceNewEl = document.querySelector(".price-new");
const priceOldEl = document.querySelector(".price-old");

// Lấy giá trị cơ bản của 1 sản phẩm từ thuộc tính data-attribute
let basePrice = 0;
let basePriceNew = 0;
if (priceWrap) {
  basePrice = parseInt(priceWrap.getAttribute("data-base-price")) || 0;
  basePriceNew =
    parseInt(priceWrap.getAttribute("data-base-price-new")) || basePrice;
}

function updateTotalPrice() {
  const qty = parseInt(qtyInput.value) || 1;

  if (priceNewEl) {
    priceNewEl.textContent = (basePriceNew * qty).toLocaleString("vi-VN") + "đ";
  }

  if (priceOldEl) {
    priceOldEl.textContent = (basePrice * qty).toLocaleString("vi-VN") + "đ";
  }
}

function getCurrentStock() {
  const checkedSize = document.querySelector('input[name="size"]:checked');
  return checkedSize ? parseInt(checkedSize.dataset.stock) : 1;
}

function updateStock(stock) {
  stockDisplay.textContent = stock;
  qtyInput.value = 1; // Reset số lượng về 1 khi người dùng đổi size
  updateTotalPrice();
}

// --- XỬ LÝ CHỌN SIZE ---
sizeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    updateStock(getCurrentStock());

    const sizeLabels = document.querySelectorAll(".size-btn");
    sizeLabels.forEach((label) => label.classList.remove("active"));

    const activeLabel = document.querySelector(`label[for="${input.id}"]`);
    if (activeLabel) {
      activeLabel.classList.add("active");
    }
  });
});

// Gắn class active cho size được chọn mặc định ban đầu
const defaultCheckedInput = document.querySelector(
  'input[name="size"]:checked',
);
if (defaultCheckedInput) {
  const activeLabel = document.querySelector(
    `label[for="${defaultCheckedInput.id}"]`,
  );
  if (activeLabel) activeLabel.classList.add("active");
}

// --- XỬ LÝ TĂNG/GIẢM SỐ LƯỢNG ---
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

//Thêm giỏ hàng
const buttonAddToCart = document.querySelector(".btn-submit-cart");
buttonAddToCart.addEventListener("click", () => {
  const productId = buttonAddToCart.getAttribute("product-id");
  const selectedSizeInput = document.querySelector(
    'input[name="size"]:checked',
  ).value;
  const quantity = parseInt(qtyInput.value);

  const cartItem = {
    productId: productId,
    size: selectedSizeInput,
    quantity: quantity,
  };
  const cart = JSON.parse(localStorage.getItem("cart"));
  const indexItemExist = cart.findIndex((item) => item.productId == productId);
  if (indexItemExist != -1) {
    cart[indexItemExist].quantity += quantity;
  } else {
    cart.push(cartItem);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "/cart";
});

///Initial Cart
const cart = localStorage.getItem("cart");
if (!cart) {
  localStorage.setItem("cart", JSON.stringify([]));
}
///End Initial Cart
