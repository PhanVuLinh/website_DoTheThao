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

// slider promo
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
// end slider promo

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
      const activeLabel = document.querySelector(`label[for="${input.id}"]`);
      if (activeLabel) activeLabel.classList.add("active");
    });
  });

  const defaultCheckedInput = document.querySelector(
    'input[name="size"]:checked',
  );
  if (defaultCheckedInput) {
    const activeLabel = document.querySelector(
      `label[for="${defaultCheckedInput.id}"]`,
    );
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

// add to cart
const buttonAddToCart = document.querySelector(".btn-submit-cart");
if (buttonAddToCart) {
  buttonAddToCart.addEventListener("click", () => {
    const productId = buttonAddToCart.getAttribute("product-id");
    const selectedSizeElement = document.querySelector(
      'input[name="size"]:checked',
    );

    if (!selectedSizeElement) {
      alert("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!");
      return;
    }

    const selectedSizeInput = selectedSizeElement.value;
    const quantity = parseInt(document.getElementById("quantity").value) || 1;

    const cartItem = {
      productId: productId,
      size: selectedSizeInput,
      quantity: quantity,
    };

    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    const indexItemExist = currentCart.findIndex(
      (item) => item.productId == productId && item.size == selectedSizeInput,
    );

    if (indexItemExist != -1) {
      currentCart[indexItemExist].quantity += quantity;
    } else {
      currentCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.location.href = "/cart";
  });
}
// end add to cart

// initial cart
let cart = localStorage.getItem("cart");
if (!cart) {
  localStorage.setItem("cart", JSON.stringify([]));
}
// end initial cart

// mini cart
const miniCart = document.querySelector("[mini-cart]");
if (miniCart) {
  const cartArr = JSON.parse(cart);
  const totalQuantity = cartArr.reduce((sum, item) => sum + item.quantity, 0);
  miniCart.textContent = totalQuantity;
}
// end mini cart

// Cart page
const drawCart = () => {
  const cart = localStorage.getItem("cart");
  fetch(`/cart/detail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: cart,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.code === 200) {
        let subTotalPrice = 0;
        const htmlCart = data.cart.map((item) => {
          const priceNew = (item.price * (100 - item.discountPercentage)) / 100;
          const itemTotalPrice = priceNew * item.quantity;
          subTotalPrice += itemTotalPrice;
          return `
            <div class="cart-item">
              <div class="cart-item__checkbox">
                <input type="checkbox" checked="checked">
              </div>
              <a href="/product/detail/${item.slug}">
                <img class="cart-item__img" src="${item.thumbnail}" alt="${item.title}">
              </a>
              <div class="cart-item__info">
                <a href="/product/detail/${item.slug}" class="name">${item.title}</a>
                <p class="variant">Phân loại: ${item.size}</p>
              </div>
              
              <div class="cart-item__action">
                <div class="qty-control">
                  <button class="btn-qty minus">-</button>
                  <input type="number" value="${item.quantity}" min="1">
                  <button class="btn-qty plus">+</button>
                </div>
                <div class="item-price">${itemTotalPrice.toLocaleString("vi-VN")} đ</div>
              </div>
            </div>
            `;
        });
        const cartList = document.querySelector(".cart-list");
        cartList.innerHTML = htmlCart.join("");

        localStorage.setItem("cart", JSON.stringify(data.cart));

        const cartSubTotal = document.querySelector("[cart-sub-total]");
        const cartTotal = document.querySelector("[cart-total]");
        if (cartSubTotal)
          cartSubTotal.innerHTML = subTotalPrice.toLocaleString("vi-VN") + " đ";
        if (cartTotal)
          cartTotal.innerHTML = subTotalPrice.toLocaleString("vi-VN") + " đ";
      }
    });
};

const cartPage = document.querySelector(".cart-page");
if (cartPage) {
  drawCart();
}
//End  Cart page
