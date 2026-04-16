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
