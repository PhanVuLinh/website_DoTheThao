function togglePassword() {
  const passInput = document.getElementById("password");
  const eyeIcon = document.querySelector(".toggle-password");

  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  } else {
    passInput.type = "password";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  }
}

// 1. Hàm bật/tắt hiển thị mật khẩu (Dùng cho trang Login)
function togglePassword() {
  const passInput = document.getElementById("password");
  const eyeIcon = document.querySelector(".toggle-password");

  // Kiểm tra xem thẻ input và icon có tồn tại trên trang hiện tại không
  if (passInput && eyeIcon) {
    if (passInput.type === "password") {
      passInput.type = "text";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    } else {
      passInput.type = "password";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    }
  }
}

// 2. Khởi tạo các Component khi trang web load xong
document.addEventListener("DOMContentLoaded", function () {
  // --- KHỞI TẠO BIỂU ĐỒ DOANH THU (Dùng cho trang Dashboard) ---
  const ctx = document.getElementById("revenueChart");

  if (ctx) {
    new Chart(ctx, {
      type: "line",
      data: {
        // Trục X: Các mốc thời gian/giá trị
        labels: [
          "5k",
          "10k",
          "15k",
          "20k",
          "25k",
          "30k",
          "35k",
          "40k",
          "45k",
          "50k",
          "55k",
          "60k",
        ],
        datasets: [
          {
            label: "Doanh thu",
            // Trục Y: Dữ liệu doanh thu (Giả lập để tạo đường dốc nhấp nhô)
            data: [20, 30, 45, 30, 85, 35, 50, 45, 60, 25, 70, 55],
            borderColor: "#466BD6", // Màu xanh dương của đường Line
            backgroundColor: "rgba(70, 107, 214, 0.1)", // Màu gradient mờ dưới đường Line
            borderWidth: 2,
            pointBackgroundColor: "#466BD6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.4, // Làm cho đường gấp khúc mềm mại (bo cong)
            fill: true, // Cho phép tô màu phần bên dưới đường Line
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Để biểu đồ fill đầy container height: 350px
        plugins: {
          legend: { display: false }, // Ẩn nhãn "Doanh thu" ở trên cùng
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              // Thêm dấu % vào sau các con số ở trục Y (giống ảnh mẫu)
              callback: function (value) {
                return value + "%";
              },
            },
          },
          x: {
            grid: { display: false }, // Ẩn lưới sọc dọc cho gọn gàng
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });
  }
});
