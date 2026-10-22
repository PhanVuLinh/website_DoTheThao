/**
 * ====================================================================
 * TITISPORT ANIMATION & REVEAL ENGINE V2 (JAVASCRIPT)
 * ====================================================================
 * Động cơ hiệu ứng chuyển động mạnh mẽ:
 * 1. Thanh tiến trình tải trang (Top Progress Bar)
 * 2. Punchy Scroll Reveal (IntersectionObserver & Stagger Cascade)
 * 3. 3D Magnetic Tilt & Radial Cursor Spotlight trên Thẻ sản phẩm
 * 4. Add-to-Cart & Wishlist Flying Thumbnail Parabolic Arc
 * 5. Nút Cuộn Đầu Trang (Back-To-Top) với Vòng tròn SVG Tiến độ cuộn
 * 6. Hiệu ứng đếm số tăng dần (Number Counter Roll)
 * 7. Hiệu ứng sóng nước lan tỏa (Ripple Click Effect)
 * 8. Pháo hoa Confetti chúc mừng (Celebration Burst)
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ==================================================================
  // 1. THANH TIẾN TRÌNH TẢI TRANG ĐỈNH (TOP PROGRESS BAR)
  // ==================================================================
  function initPageProgressBar() {
    let bar = document.getElementById("pageTopProgressBar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "pageTopProgressBar";
      document.body.prepend(bar);
    }

    bar.style.width = "35%";

    const onReady = () => {
      bar.style.width = "80%";
    };

    const onLoad = () => {
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.opacity = "0";
        setTimeout(() => {
          if (bar && bar.parentNode) bar.remove();
        }, 400);
      }, 200);
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
  // 2. SCROLL REVEAL OBSERVER (INTERSECTION OBSERVER & STAGGERS)
  // ==================================================================
  function initScrollReveal() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
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

    const targetSelectors = [
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
      ".product-detail-left",
      ".product-detail-right",
      ".cart-table-wrapper",
      ".cart-summary-box",
      ".compare-table-container",
      ".dashboard-hero",
      ".stat-widgets .widget-card",
      ".chart-section",
      ".recent-orders-card",
      ".table-card",
      ".filter-box",
      ".login-box",
      ".booking-card"
    ];

    const elementsToObserve = document.querySelectorAll(targetSelectors.join(", "));

    // Phân tầng Delay cho Grid
    const gridContainers = document.querySelectorAll(
      ".trust-grid, .voucher-grid, .flash-sale-grid, .products-grid, .stat-widgets, .brands-grid, .sports-hub-grid"
    );

    gridContainers.forEach((grid) => {
      const children = Array.from(grid.children);
      children.forEach((child, idx) => {
        child.classList.add(`anim-delay-${Math.min((idx % 6) + 1, 6)}`);
      });
    });

    elementsToObserve.forEach((el) => {
      if (!el.classList.contains("reveal-init")) {
        el.classList.add("reveal-init");
      }

      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        requestAnimationFrame(() => el.classList.add("revealed"));
      } else {
        revealObserver.observe(el);
      }
    });

    // Observer hỗ trợ các component render sau qua AJAX / Filter
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.matches && node.matches(".flash-product-card, .widget-card, .voucher-card")) {
              node.classList.add("reveal-init");
              revealObserver.observe(node);
              attachCard3DTilt(node);
            }
            if (node.querySelectorAll) {
              const nested = node.querySelectorAll(".flash-product-card, .widget-card, .voucher-card");
              nested.forEach((item) => {
                item.classList.add("reveal-init");
                revealObserver.observe(item);
                attachCard3DTilt(item);
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
  // 3. 3D MAGNETIC TILT & RADIAL CURSOR SPOTLIGHT TRÊN THẺ SẢN PHẨM
  // ==================================================================
  function attachCard3DTilt(card) {
    if (prefersReducedMotion || window.innerWidth < 1024) return;
    if (card._tiltAttached) return;
    card._tiltAttached = true;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Cập nhật tọa độ cho Radial Spotlight
      card.style.setProperty("--spotlight-x", `${x}px`);
      card.style.setProperty("--spotlight-y", `${y}px`);
      card.style.setProperty("--spotlight-opacity", "1");

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7; // max 7 deg
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--spotlight-opacity", "0");
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
    });
  }

  function initAllCardsTilt() {
    const cards = document.querySelectorAll(".flash-product-card, .hero-spotlight-card");
    cards.forEach((card) => attachCard3DTilt(card));
  }

  // ==================================================================
  // 4. ADD-TO-CART & WISHLIST PARABOLIC FLYING THUMBNAIL
  // ==================================================================
  function triggerFlyingItem(sourceImgEl, targetSelector) {
    if (prefersReducedMotion || !sourceImgEl) return;

    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    const startRect = sourceImgEl.getBoundingClientRect();
    const endRect = targetEl.getBoundingClientRect();

    if (startRect.width === 0 || startRect.height === 0) return;

    const ghost = document.createElement("img");
    ghost.src = sourceImgEl.src;
    ghost.className = "flying-ghost-item";
    ghost.style.left = `${startRect.left}px`;
    ghost.style.top = `${startRect.top}px`;
    ghost.style.width = `${startRect.width}px`;
    ghost.style.height = `${startRect.height}px`;

    document.body.appendChild(ghost);

    // Kích hoạt transition parabolic sau 1 frame
    requestAnimationFrame(() => {
      ghost.style.left = `${endRect.left + endRect.width / 2 - 16}px`;
      ghost.style.top = `${endRect.top + endRect.height / 2 - 16}px`;
      ghost.style.width = "32px";
      ghost.style.height = "32px";
      ghost.style.opacity = "0.75";
      ghost.style.transform = "rotate(360deg) scale(0.4)";
    });

    setTimeout(() => {
      if (ghost && ghost.parentNode) ghost.remove();
      // Wiggle và nổ confetti tại icon đích
      const badge = targetEl.querySelector(".action-badge") || targetEl;
      badge.classList.remove("wiggle-active");
      void badge.offsetWidth; // trigger reflow
      badge.classList.add("wiggle-active");

      spawnConfetti(endRect.left + endRect.width / 2, endRect.top + endRect.height / 2);
    }, 750);
  }

  function initFlyingItemTriggers() {
    document.addEventListener("click", (e) => {
      // 1. Thêm vào giỏ từ trang chi tiết
      const btnAddToCart = e.target.closest("#btnAddToCart, .btn-submit-cart");
      if (btnAddToCart) {
        const mainImg = document.getElementById("main-image") || document.querySelector(".main-image img");
        if (mainImg) {
          triggerFlyingItem(mainImg, ".cart-action-btn");
        }
        return;
      }

      // 2. Nút yêu thích
      const btnWishlist = e.target.closest(".btn-wishlist-toggle, #btnWishlistDetail");
      if (btnWishlist) {
        let thumbImg = null;
        const card = btnWishlist.closest(".flash-product-card");
        if (card) {
          thumbImg = card.querySelector(".flash-product-card__img-wrap img");
        } else {
          thumbImg = document.getElementById("main-image") || document.querySelector(".main-image img");
        }
        if (thumbImg) {
          triggerFlyingItem(thumbImg, ".wishlist-action-btn");
        }
        return;
      }

      // 3. Nút so sánh
      const btnCompare = e.target.closest(".btn-compare-toggle, #btnCompareDetail");
      if (btnCompare) {
        let thumbImg = null;
        const card = btnCompare.closest(".flash-product-card");
        if (card) {
          thumbImg = card.querySelector(".flash-product-card__img-wrap img");
        } else {
          thumbImg = document.getElementById("main-image") || document.querySelector(".main-image img");
        }
        if (thumbImg) {
          triggerFlyingItem(thumbImg, ".compare-action-btn");
        }
        return;
      }

      // 4. Nút sao chép mã Voucher
      const btnVoucher = e.target.closest(".btn-copy-voucher, .btn-vault-hot-copy");
      if (btnVoucher) {
        const rect = btnVoucher.getBoundingClientRect();
        spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });
  }

  // ==================================================================
  // 5. NÚT CUỘN ĐẦU TRANG VỚI VÒNG TRÒN SVG TIẾN ĐỘ CUỘN
  // ==================================================================
  function initScrollProgressBtn() {
    // Không chạy nút cuộn Back to top trên trang quản trị Admin (trang admin cuộn trong .admin-content và dùng layout flex)
    if (document.body.classList.contains("admin-body") || window.location.pathname.startsWith("/admin")) {
      const existing = document.getElementById("scrollProgressBtn");
      if (existing) existing.remove();
      return;
    }

    let btn = document.getElementById("scrollProgressBtn");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "scrollProgressBtn";
      btn.className = "scroll-progress-btn";
      btn.type = "button";
      btn.title = "Cuộn lên đầu trang";
      btn.setAttribute("aria-label", "Cuộn lên đầu trang");

      btn.innerHTML = `
        <svg class="scroll-progress-svg" viewBox="0 0 50 50">
          <defs>
            <linearGradient id="scrollProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2563eb" />
              <stop offset="100%" stop-color="#ff4722" />
            </linearGradient>
          </defs>
          <circle class="scroll-progress-circle-bg" cx="25" cy="25" r="22" />
          <circle class="scroll-progress-circle-bar" cx="25" cy="25" r="22" id="scrollProgressCircleBar" />
        </svg>
        <i class="fa-solid fa-arrow-up scroll-progress-icon"></i>
      `;

      document.body.appendChild(btn);
    }

    const circleBar = document.getElementById("scrollProgressCircleBar");
    const circumference = 138.2; // 2 * PI * 22

    const updateScrollProgress = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight > 0) {
        const progress = Math.min(Math.max(scrollY / docHeight, 0), 1);
        const offset = circumference - progress * circumference;
        if (circleBar) circleBar.style.strokeDashoffset = offset;
      }

      if (scrollY > 280) {
        btn.classList.add("is-active");
      } else {
        btn.classList.remove("is-active");
      }
    };

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // ==================================================================
  // 6. PHÁO HOA CELEBRATION CONFETTI BURST
  // ==================================================================
  function spawnConfetti(originX, originY) {
    if (prefersReducedMotion) return;

    const colors = ["#2563eb", "#38bdf8", "#ff4722", "#f59e0b", "#10b981", "#8b5cf6"];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "confetti-particle";

      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4;
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 110 + 35;

      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance + 35; // rơi nhẹ theo trọng lực
      const rot = Math.random() * 720 - 360;

      particle.style.backgroundColor = color;
      particle.style.width = `${size}px`;
      particle.style.height = `${size * 0.65}px`;
      particle.style.left = `${originX}px`;
      particle.style.top = `${originY}px`;
      particle.style.setProperty("--tx", `${tx}px`);
      particle.style.setProperty("--ty", `${ty}px`);
      particle.style.setProperty("--rot", `${rot}deg`);

      document.body.appendChild(particle);

      setTimeout(() => {
        if (particle && particle.parentNode) particle.remove();
      }, 1250);
    }
  }
  window.spawnConfetti = spawnConfetti;

  // ==================================================================
  // 7. SÓNG NƯỚC RIPPLE KHI CLICK BUTTON
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

      const existing = btn.querySelector(".ripple-wave");
      if (existing) existing.remove();

      btn.appendChild(ripple);

      setTimeout(() => {
        if (ripple && ripple.parentNode) ripple.remove();
      }, 650);
    });
  }

  // ==================================================================
  // 8. ĐẾM SỐ TĂNG DẦN (NUMBER COUNTER ROLL)
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
  // 9. KHỞI CHẠY TỔNG HỢP HỆ THỐNG HIỆU ỨNG
  // ==================================================================
  function initAllAnimations() {
    initPageProgressBar();
    initScrollReveal();
    initAllCardsTilt();
    initFlyingItemTriggers();
    initScrollProgressBtn();
    initRippleEffect();
    initCounterAnimation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllAnimations);
  } else {
    initAllAnimations();
  }
})();
