/**
 * ==========================================================================
 * FORM VALIDATOR & RESILIENT DATA RETENTION ENGINE
 * Hỗ trợ xác thực biểu mẫu tức thì, không reload trang khi có lỗi,
 * báo lỗi chính xác tại từng trường và giữ 100% dữ liệu đã nhập.
 * ==========================================================================
 */

(function () {
  "use strict";

  // Regex tiêu chuẩn
  const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const REGEX_PHONE = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

  /**
   * Lấy nhãn đại diện của trường để tạo thông báo thân thiện
   */
  function getFieldLabel(input) {
    if (input.dataset.label) return input.dataset.label;
    
    // Tìm thẻ label tương ứng trong form-group
    const formGroup = input.closest(".form-group");
    if (formGroup) {
      const labelEl = formGroup.querySelector("label:not(.remember-me):not(.upload-box)");
      if (labelEl) {
        // Lấy text không bao gồm dấu *
        return labelEl.textContent.replace(/[*:]/g, "").trim();
      }
    }
    
    if (input.placeholder && !input.placeholder.startsWith("Ví dụ") && !input.placeholder.startsWith("Nhập")) {
      return input.placeholder.trim();
    }
    
    const name = input.getAttribute("name") || "";
    const nameMap = {
      fullName: "Họ và tên",
      email: "Email",
      password: "Mật khẩu",
      confirmPassword: "Xác nhận mật khẩu",
      phone: "Số điện thoại",
      address: "Địa chỉ",
      title: "Tiêu đề",
      code: "Mã",
      price: "Giá",
      discountPercentage: "Phần trăm giảm giá",
      quantity: "Số lượng",
      position: "Vị trí",
      description: "Mô tả",
      note: "Ghi chú",
    };
    return nameMap[name] || "Trường này";
  }

  /**
   * Hiển thị lỗi tại một trường cụ thể
   */
  function showFieldError(input, message) {
    input.classList.add("is-invalid");
    input.classList.remove("shake-input");
    // Trigger reflow for shake animation
    void input.offsetWidth;
    input.classList.add("shake-input");

    const formGroup = input.closest(".form-group") || input.parentElement;
    if (!formGroup) return;

    // Tìm hoặc tạo invalid-feedback
    let feedback = formGroup.querySelector(".invalid-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "invalid-feedback";
      // Chèn sau input hoặc sau input-group
      if (input.nextSibling) {
        formGroup.insertBefore(feedback, input.nextSibling);
      } else {
        formGroup.appendChild(feedback);
      }
    }

    feedback.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${message}</span>`;
    feedback.style.display = "flex";
  }

  /**
   * Xóa lỗi tại một trường
   */
  function clearFieldError(input) {
    input.classList.remove("is-invalid");
    input.classList.remove("shake-input");

    const formGroup = input.closest(".form-group") || input.parentElement;
    if (formGroup) {
      const feedback = formGroup.querySelector(".invalid-feedback");
      if (feedback) {
        feedback.style.display = "none";
        feedback.innerHTML = "";
      }
    }
  }

  /**
   * Kiểm tra một input có hợp lệ hay không
   */
  function validateSingleInput(input) {
    if (input.disabled || input.type === "hidden") return true;

    const val = (input.value || "").trim();
    const label = getFieldLabel(input);
    const isRequired = input.hasAttribute("required") || input.hasAttribute("data-required");

    // 1. Kiểm tra trường bắt buộc
    if (isRequired && val === "") {
      showFieldError(input, `Vui lòng nhập ${label.toLowerCase()}!`);
      return false;
    }

    // Nếu không bắt buộc và bỏ trống thì bỏ qua các quy tắc định dạng
    if (!isRequired && val === "") {
      clearFieldError(input);
      return true;
    }

    // 2. Kiểm tra định dạng Email
    if (input.type === "email" || input.dataset.rule === "email") {
      if (!REGEX_EMAIL.test(val)) {
        showFieldError(input, "Email không hợp lệ (Ví dụ: name@gmail.com)!");
        return false;
      }
    }

    // 3. Kiểm tra định dạng Số điện thoại
    if (input.type === "tel" || input.name === "phone" || input.dataset.rule === "phone") {
      if (!REGEX_PHONE.test(val)) {
        showFieldError(input, "Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu bằng 0)!");
        return false;
      }
    }

    // 4. Kiểm tra độ dài tối thiểu (minlength)
    const minLength = parseInt(input.getAttribute("minlength") || input.dataset.minlength, 10);
    if (!isNaN(minLength) && val.length < minLength) {
      showFieldError(input, `${label} phải chứa ít nhất ${minLength} ký tự!`);
      return false;
    }

    // 5. Kiểm tra khớp mật khẩu (data-match)
    const matchSelector = input.getAttribute("data-match");
    if (matchSelector) {
      const form = input.closest("form");
      const targetInput = form ? form.querySelector(matchSelector) : document.querySelector(matchSelector);
      if (targetInput && val !== targetInput.value.trim()) {
        showFieldError(input, "Mật khẩu xác nhận không khớp!");
        return false;
      }
    }

    // 6. Kiểm tra số âm / số nguyên
    if (input.type === "number") {
      const minVal = parseFloat(input.getAttribute("min"));
      const numVal = parseFloat(val);
      if (isNaN(numVal)) {
        showFieldError(input, `${label} phải là một số hợp lệ!`);
        return false;
      }
      if (!isNaN(minVal) && numVal < minVal) {
        showFieldError(input, `${label} không được nhỏ hơn ${minVal}!`);
        return false;
      }
    }

    clearFieldError(input);
    return true;
  }

  /**
   * Khởi tạo trình xác thực cho một form
   */
  function attachValidatorToForm(form) {
    if (form.dataset.validatorAttached) return;
    form.dataset.validatorAttached = "true";

    // Lắng nghe sự kiện người dùng gõ phím / đổi giá trị để xóa lỗi ngay lập tức
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        if (this.classList.contains("is-invalid")) {
          validateSingleInput(this);
        }
      });

      input.addEventListener("change", function () {
        if (this.classList.contains("is-invalid")) {
          validateSingleInput(this);
        }
      });

      // Kiểm tra khi rời khỏi ô (blur)
      input.addEventListener("blur", function () {
        if (this.value.trim() !== "" || this.hasAttribute("required")) {
          validateSingleInput(this);
        }
      });
    });

    // Bắt sự kiện Submit form
    form.addEventListener("submit", function (e) {
      let isFormValid = true;
      let firstInvalidInput = null;

      inputs.forEach((input) => {
        const isValid = validateSingleInput(input);
        if (!isValid) {
          isFormValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = input;
          }
        }
      });

      if (!isFormValid) {
        e.preventDefault();
        e.stopPropagation();

        if (firstInvalidInput) {
          firstInvalidInput.scrollIntoView({ behavior: "smooth", block: "center" });
          firstInvalidInput.focus();
        }

        if (typeof Swal !== "undefined") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: "Vui lòng kiểm tra lại thông tin bị lỗi!",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
        return false;
      }
    });
  }

  /**
   * Tự động hiển thị lỗi từ Server gửi về (Server-Side Form Errors)
   */
  function handleServerFormErrors() {
    if (typeof window.formErrors === "object" && window.formErrors !== null) {
      let firstServerField = null;
      for (const [fieldName, errorMsg] of Object.entries(window.formErrors)) {
        const input = document.querySelector(`[name="${fieldName}"]`);
        if (input && errorMsg) {
          showFieldError(input, errorMsg);
          if (!firstServerField) firstServerField = input;
        }
      }
      if (firstServerField) {
        setTimeout(() => {
          firstServerField.scrollIntoView({ behavior: "smooth", block: "center" });
          firstServerField.focus();
        }, 150);
      }
    }
  }

  /**
   * Khởi tạo toàn bộ các form trên trang
   */
  function init() {
    const forms = document.querySelectorAll("form:not([no-validate])");
    forms.forEach(attachValidatorToForm);
    handleServerFormErrors();
  }

  // Tự động chạy khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Xuất ra window để gọi lại nếu cần
  window.FormValidator = {
    init: init,
    validateInput: validateSingleInput,
    showError: showFieldError,
    clearError: clearFieldError,
  };
})();
