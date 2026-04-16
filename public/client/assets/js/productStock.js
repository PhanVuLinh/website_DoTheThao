document.addEventListener("DOMContentLoaded", function () {
  const qtyInput = document.getElementById("quantity");
  const stockDisplay = document.getElementById("current-stock");
  const btnPlus = document.querySelector(".btn-qty-custom.plus");
  const btnMinus = document.querySelector(".btn-qty-custom.minus");
  const sizeInputs = document.querySelectorAll('input[name="size"]');

  // Lấy stock của size đang được chọn
  function getCurrentStock() {
    const checkedSize = document.querySelector('input[name="size"]:checked');
    return checkedSize ? parseInt(checkedSize.dataset.stock) : 1;
  }

  // Cập nhật hiển thị stock + reset quantity về 1
  function updateStock(stock) {
    stockDisplay.textContent = stock;
    qtyInput.value = 1;
  }

  // Khi đổi size → cập nhật tồn kho + reset qty
  sizeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      updateStock(getCurrentStock());
    });
  });

  // Nút tăng
  btnPlus.addEventListener("click", () => {
    const max = getCurrentStock();
    let current = parseInt(qtyInput.value);
    if (current < max) {
      qtyInput.value = current + 1;
    }
  });

  // Nút giảm
  btnMinus.addEventListener("click", () => {
    let current = parseInt(qtyInput.value);
    if (current > 1) {
      qtyInput.value = current - 1;
    }
  });
});