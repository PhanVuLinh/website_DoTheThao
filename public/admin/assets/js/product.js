let sizeCounter = 0;

function createSizeField(sizeValue = "", stockValue = "") {
  const row = document.createElement("div");
  row.className = "size-input-row";

  const sizeInput = document.createElement("input");
  sizeInput.type = "text";
  sizeInput.name = `sizes[${sizeCounter}][size]`;
  sizeInput.placeholder = "Tên size (VD: 39, M, XL...)";
  sizeInput.value = sizeValue;
  sizeInput.className = "form-control";
  sizeInput.style.flex = "1";

  const stockInput = document.createElement("input");
  stockInput.type = "number";
  stockInput.name = `sizes[${sizeCounter}][stock]`;
  stockInput.placeholder = "Số lượng";
  stockInput.value = stockValue;
  stockInput.min = 0;
  stockInput.className = "form-control";
  stockInput.style.flex = "1";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn-remove-size";
  removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  removeBtn.onclick = function () {
    this.parentElement.remove();
  };

  row.appendChild(sizeInput);
  row.appendChild(stockInput);
  row.appendChild(removeBtn);

  sizeCounter++;
  return row;
}

function addSizeField() {
  const container = document.getElementById("dynamic-size-list");
  container.appendChild(createSizeField());
}

window.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("dynamic-size-list");

  // EDIT PAG
  if (window.productSizes && window.productSizes.length > 0) {
    window.productSizes.forEach((item) => {
      container.appendChild(createSizeField(item.size, item.stock));
    });
  }
  // CREATE PAG
  else {
    addSizeField();
  }
});
