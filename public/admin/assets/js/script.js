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
    // Tạo mảng 30 ngày cho trục X (Từ ngày 1 đến 30)
    const daysInMonth = Array.from({ length: 30 }, (_, i) => "Ngày " + (i + 1));
    
    // Dữ liệu doanh thu giả lập trong khoảng 500k đến 10 triệu
    const revenueData = [
      500000, 1200000, 800000, 2500000, 1800000, 4000000, 3500000, 5200000,
      4800000, 6000000, 4500000, 7200000, 8500000, 6800000, 5500000, 7800000,
      9000000, 10000000, 8200000, 6500000, 5000000, 4200000, 5800000, 7000000,
      8500000, 7500000, 9200000, 8800000, 9800000, 10000000
    ];

    new Chart(ctx, {
      type: "line",
      data: {
        labels: daysInMonth, // Trục X: Các ngày trong tháng
        datasets: [
          {
            label: "Doanh thu",
            data: revenueData, // Trục Y: Dữ liệu số tiền
            borderColor: "#466BD6", // Màu xanh dương của đường Line
            backgroundColor: "rgba(70, 107, 214, 0.1)", // Màu gradient mờ dưới đường
            borderWidth: 2,
            pointBackgroundColor: "#466BD6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 3, // Giảm size chấm tròn xuống chút xíu vì 30 ngày khá dày
            tension: 0.4, // Làm cho đường gấp khúc mềm mại (bo cong)
            fill: true, // Tô màu phần bên dưới đường Line
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, // Ẩn nhãn "Doanh thu" ở trên cùng
          tooltip: {
            callbacks: {
              // Format lại số tiền khi trỏ chuột vào điểm trên biểu đồ
              label: function(context) {
                let value = context.parsed.y;
                return "Doanh thu: " + value.toLocaleString('vi-VN') + " đ";
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMin: 500000, // Gợi ý mức thấp nhất là 500k
            suggestedMax: 10000000, // Gợi ý mức cao nhất là 10M
            ticks: {
              // Format số tiền ở trục Y (VD: 5.000.000 đ)
              callback: function (value) {
                return value.toLocaleString('vi-VN') + " đ";
              },
            },
          },
          x: {
            grid: { display: false }, // Ẩn lưới sọc dọc cho gọn
            ticks: {
              maxTicksLimit: 15 // Giới hạn số lượng ngày hiển thị ở trục X tránh bị rối mắt
            }
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