// tăng / giảm số lượng
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

// cập nhật tổng tiền
const updateCartTotal = () => {
  const cartItems = document.querySelectorAll(".cart-item");
  let total = 0;

  cartItems.forEach((item) => {
    const price = item
      .querySelector(".item-price")
      .innerText.replace(/\./g, "")
      .replace(" đ", "");

    total += parseInt(price);
  });

  document.querySelectorAll(".cart-total").forEach((el) => {
    el.innerText = total.toLocaleString("vi-VN") + " đ";
  });
};

// cập nhật số lượng
const handleQtyChange = () => {
  const inputsQuantity = document.querySelectorAll("input[name='quantity']");

  inputsQuantity.forEach((input) => {
    input.addEventListener("input", () => {
      const productId = input.getAttribute("product-id");
      const quantity = parseInt(input.value);

      const cartItem = input.closest(".cart-item");
      const priceNew = parseInt(cartItem.getAttribute("data-price-new"));

      const itemPrice = cartItem.querySelector(".item-price");
      const total = priceNew * quantity;
      itemPrice.innerText = total.toLocaleString("vi-VN") + " đ";
      updateCartTotal();

      fetch(`/cart/update/${productId}/${quantity}`).catch((err) =>
        console.log(err),
      );
    });
  });
};

handleQtyChange();
