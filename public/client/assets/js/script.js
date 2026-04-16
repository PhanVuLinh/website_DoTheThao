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
// 2. KHỞI TẠO CÁC CHỨC NĂNG KHI TRANG ĐÃ TẢI XONG
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
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
});
