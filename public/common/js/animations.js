/**
 * ====================================================================
 * TITISPORT ANIMATION & REVEAL ENGINE (JAVASCRIPT)
 * ====================================================================
 * Quản lý thanh tiến trình đỉnh, Scroll Reveal (IntersectionObserver),
 * Stagger Cascade, Hiệu ứng đếm số (Counter Roll) và Ripple Click.
 */

(function () {
  "use strict";

  // Kiểm tra prefers-reduced-motion của người dùng
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ==================================================================
  // 1. THANH TIẾN TRÌNH TẢI TRANG (PAGE TOP PROGRESS BAR)
  // ==================================================================
  function initPageProgressBar() {
    let bar = document.getElementById("pageTopProgressBar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "pageTopProgressBar";
      document.body.prepend(bar);
    }

    bar.style.width = "30%";

    const onReady = () => {
      bar.style.width = "75%";
    };

    const onLoad = () => {
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.opacity = "0";
        setTimeout(() => {
          if (bar && bar.parentNode) bar.remove();
        }, 400);
      }, 250);
    };

    if (document.readyState === "interactive" || document.readyState === "complete") {
      onReady();
      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad, { once: true });
      }
    } else {
      document.addEventListener("DOMContentLoaded", onReady, { once: true });
      window.addEventListener("load", onLoad, { once: true });
    }
  }

  // ==================================================================
  // 2. SCROLL REVEAL OBSERVER (INTERSECTION OBSERVER)
  // ==================================================================
  function initScrollReveal() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      // Fallback cho trình duyệt cũ hoặc người dùng giảm chuyển động
      document.querySelectorAll(".reveal-init").forEach((el) => el.classList.add("revealed"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.08,
      }
    );

    // Danh sách các bộ chọn phần tử cần hiệu ứng xuất hiện mượt mà
    const targetSelectors = [
      // Client Home & Shop
      ".hero__content",
      ".hero__visual-column",
      ".trust-card",
      ".voucher-card",
      ".sports-nav-pills",
      ".sports-showcase-card",
      ".flash-product-card",
      ".article-card",
      ".section-header-wrap",
      ".section-header-center",
      ".footer-top-col",
      ".customer-review-card",
      ".brand-item",
      // Client Detail & Cart & Compare
      ".product-detail-left",
      ".product-detail-right",
      ".cart-table-wrapper",
      ".cart-summary-box",
      ".compare-table-container",
      // Admin Dashboard & Pages
      ".dashboard-hero",
      ".stat-widgets .widget-card",
      ".chart-section",
      ".recent-orders-card",
      ".table-card",
      ".filter-box",
      ".login-box"
    ];

    const elementsToObserve = document.querySelectorAll(targetSelectors.join(", "));

    // Phân tầng Delay (Stagger) cho các nhóm danh sách con
    const gridContainers = document.querySelectorAll(
      ".trust-grid, .voucher-grid, .flash-sale-grid, .products-grid, .stat-widgets, .brands-grid, .sports-hub-grid"
    );

    gridContainers.forEach((grid) => {
      const children = Array.from(grid.children);
      children.forEach((child, idx) => {
        const delayClass = `anim-delay-${Math.min((idx % 6) + 1, 6)}`;
        child.classList.add(delayClass);
      });
    });

    elementsToObserve.forEach((el) => {
      // Nếu phần tử chưa có class reveal-init
      if (!el.classList.contains("reveal-init")) {
        el.classList.add("reveal-init");
      }

      // Kiểm tra nếu phần tử đã nằm trong tầm nhìn lúc tải ban đầu
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        // Xuất hiện ngay lập tức với transition mượt mà
        requestAnimationFrame(() => el.classList.add("revealed"));
      } else {
        revealObserver.observe(el);
      }
    });

    // Theo dõi DOM động (Khi render thêm sản phẩm qua AJAX hoặc bộ lọc)
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.matches && node.matches(".flash-product-card, .widget-card, .voucher-card")) {
              node.classList.add("reveal-init");
              revealObserver.observe(node);
            }
            if (node.querySelectorAll) {
              const nested = node.querySelectorAll(".flash-product-card, .widget-card, .voucher-card");
              nested.forEach((item) => {
                item.classList.add("reveal-init");
                revealObserver.observe(item);
              });
            }
          }
        });
      });
    });

    const mainContent = document.querySelector("main, .admin-content, body");
    if (mainContent) {
      mutationObserver.observe(mainContent, { childList: true, subtree: true });
    }
  }

  // ==================================================================
  // 3. HIỆU ỨNG SÓNG NƯỚC RIPPLE KHI BẤM NÚT (RIPPLE EFFECT)
  // ==================================================================
  function initRippleEffect() {
    if (prefersReducedMotion) return;

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(
        "button, .btn, .btn-hero-primary, .btn-hero-secondary, .btn-buy-now, .btn-cart, .btn-spotlight-view, .btn-dock-submit, .btn-voucher-action, .btn-export-revenue, .action-btn, .sport-pill-btn"
      );

      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      const ripple = document.createElement("span");
      ripple.classList.add("ripple-wave");

      // Đổi màu ripple cho nền sáng nếu nút màu trắng hoặc xám nhạt
      const btnBg = window.getComputedStyle(btn).backgroundColor;
      if (
        btnBg === "rgb(255, 255, 255)" ||
        btnBg === "rgba(255, 255, 255, 1)" ||
        btn.classList.contains("btn-dock-clear") ||
        btn.classList.contains("btn-hero-secondary")
      ) {
        ripple.classList.add("ripple-wave--dark");
      }

      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;

      // Xóa ripple cũ nếu có
      const existing = btn.querySelector(".ripple-wave");
      if (existing) existing.remove();

      btn.appendChild(ripple);

      setTimeout(() => {
        if (ripple && ripple.parentNode) ripple.remove();
      }, 650);
    });
  }

  // ==================================================================
  // 4. HIỆU ỨNG ĐẾM SỐ TĂNG DẦN (NUMBER COUNTER ROLL)
  // ==================================================================
  function animateValue(obj, start, end, duration, prefix = "", suffix = "") {
    if (prefersReducedMotion) {
      obj.textContent = `${prefix}${end.toLocaleString("vi-VN")}${suffix}`;
      return;
    }

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic formula
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(start + (end - start) * easeOut);

      obj.textContent = `${prefix}${currentVal.toLocaleString("vi-VN")}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.textContent = `${prefix}${end.toLocaleString("vi-VN")}${suffix}`;
      }
    };
    window.requestAnimationFrame(step);
  }

  function initCounterAnimation() {
    // Chỉ chạy trên các số liệu nổi bật như KPI Admin Widget
    const counterElements = document.querySelectorAll(
      ".widget-card .value, .stat-pill-num, [data-counter]"
    );

    if (counterElements.length === 0) return;

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const originalText = el.textContent.trim();

            // Nhận diện định dạng tiền tệ hoặc số thông thường
            let isCurrency = originalText.includes("đ") || originalText.includes("₫");
            let cleanNumberStr = originalText.replace(/[^\d]/g, "");
            let targetNumber = parseInt(cleanNumberStr, 10);

            if (!isNaN(targetNumber) && targetNumber > 0) {
              const suffix = isCurrency ? " đ" : "";
              animateValue(el, 0, targetNumber, 1200, "", suffix);
            }

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    counterElements.forEach((el) => counterObserver.observe(el));
  }

  // ==================================================================
  // 5. HIỆU ỨNG 3D TILT KHI RÊ CHUỘT (SPOTLIGHT CARDS)
  // ==================================================================
  function initTiltEffect() {
    if (prefersReducedMotion || window.innerWidth < 1024) return;

    const tiltCards = document.querySelectorAll(".hero-spotlight-card");
    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      });
    });
  }

  // ==================================================================
  // 6. KHỞI TẠO TỔNG THỂ KHI TRANG TẢI
  // ==================================================================
  function initAllAnimations() {
    initPageProgressBar();
    initScrollReveal();
    initRippleEffect();
    initCounterAnimation();
    initTiltEffect();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllAnimations);
  } else {
    initAllAnimations();
  }
})();
