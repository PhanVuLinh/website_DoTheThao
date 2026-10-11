// Realtime Socket.IO cho Admin Dashboard
(function () {
  if (typeof io === "undefined") return;

  const socket = io();

  // Tham gia phòng Admin
  socket.emit("JOIN_ADMIN_ROOM");

  // Âm thanh thông báo đơn hàng mới sử dụng Web Audio API (Không phụ thuộc file mp3 ngoài)
  function playNewOrderSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playTone = (freq, type, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      // Ting-Ting chord (587Hz -> 880Hz)
      playTone(587.33, "sine", now, 0.25);
      playTone(880.00, "sine", now + 0.12, 0.4);
    } catch (e) {
      console.warn("Không thể phát âm thanh thông báo:", e);
    }
  }

  // Lắng nghe sự kiện Đơn hàng mới từ Khách hàng
  socket.on("SERVER_RETURN_NEW_ORDER", function (data) {
    console.log("🔔 Đơn hàng mới vừa được đặt:", data);

    // Phát chuông
    playNewOrderSound();

    const formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(data.total || 0);

    // Hiển thị SweetAlert2 Toast góc trên bên phải
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "success",
        title: "🎉 CÓ ĐƠN HÀNG MỚI!",
        html: `
          <div style="text-align: left; font-size: 13px; line-height: 1.6; margin-top: 6px;">
            <div>Khách hàng: <strong>${data.fullName || "Khách vãng lai"}</strong></div>
            <div>Mã đơn: <strong style="color: #2563eb; font-family: monospace;">#${data.orderCode}</strong></div>
            <div>Tổng tiền: <strong style="color: #e11d48; font-size: 14px;">${formattedPrice}</strong></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Thời gian: ${data.createdAt}</div>
          </div>
        `,
        toast: true,
        position: "top-end",
        showConfirmButton: true,
        confirmButtonText: "Xem đơn hàng",
        showCancelButton: true,
        cancelButtonText: "Đóng",
        confirmButtonColor: "#e11d48",
        cancelButtonColor: "#64748b",
        timer: 10000,
        timerProgressBar: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/admin/order/edit/${data.orderId}`;
        }
      });
    }

    // Tăng badge số lượng đơn hàng nếu có
    const orderBadge = document.querySelector(".sidebar-order-badge, #newOrderCountBadge");
    if (orderBadge) {
      let currentCount = parseInt(orderBadge.textContent) || 0;
      orderBadge.textContent = currentCount + 1;
      orderBadge.style.display = "inline-flex";
    }

    // Tăng badge trên chuông thông báo Header
    const bellBadge = document.querySelector("#notificationBtn .badge");
    if (bellBadge) {
      let bCount = parseInt(bellBadge.textContent) || 0;
      bellBadge.textContent = bCount + 1;
      bellBadge.style.display = "flex";
    }

    // Thêm mục thông báo mới vào dropdown
    const notifList = document.querySelector(".notification-list");
    if (notifList) {
      const li = document.createElement("li");
      li.className = "notification-item unread";
      li.style.cursor = "pointer";
      li.onclick = () => window.location.href = `/admin/order/edit/${data.orderId}`;
      li.innerHTML = `
        <div class="notif-icon bg-emerald" style="background: #10b981; color: #fff;">
          <i class="fa-solid fa-cart-shopping"></i>
        </div>
        <div class="notif-content">
          <p class="notif-text"><strong>#${data.orderCode}</strong>: ${data.fullName || "Khách"} vừa đặt đơn hàng mới</p>
          <span class="notif-time" style="color: #2563eb; font-weight: 600;">${formattedPrice} • Vừa xong</span>
        </div>
      `;
      notifList.insertBefore(li, notifList.firstChild);
    }

    // Nếu đang ở trang danh sách đơn hàng, hiển thị banner cập nhật
    const orderTableBody = document.querySelector(".order-table-body");
    if (orderTableBody) {
      const banner = document.createElement("div");
      banner.style.cssText = "background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; display: flex; justify-content: space-between; align-items: center;";
      banner.innerHTML = `
        <div><i class="fa-solid fa-bell" style="color: #e11d48; margin-right: 8px;"></i> Vừa có đơn hàng mới <strong>#${data.orderCode}</strong>. Bấm để cập nhật danh sách!</div>
        <button onclick="window.location.reload()" style="background: #e11d48; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">Cập nhật ngay</button>
      `;
      const tableWrapper = document.querySelector(".table-section, .filter-action-card, main");
      if (tableWrapper) {
        tableWrapper.parentNode.insertBefore(banner, tableWrapper);
      }
    }
  });

  // Lắng nghe sự kiện Khách hàng hủy đơn hàng
  socket.on("SERVER_RETURN_CANCEL_ORDER", function (data) {
    console.log("⚠️ Khách hàng đã hủy đơn:", data);

    playNewOrderSound();

    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "warning",
        title: "⚠️ ĐƠN HÀNG VỪA BỊ HỦY!",
        html: `
          <div style="text-align: left; font-size: 13px; line-height: 1.6; margin-top: 6px;">
            <div>Khách hàng: <strong>${data.fullName || "Khách hàng"}</strong></div>
            <div>Mã đơn: <strong style="color: #dc2626; font-family: monospace;">#${data.orderCode}</strong></div>
            <div>Lý do: <em>"${data.cancelReason || "Khách hàng đổi ý"}"</em></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Thời gian: ${data.createdAt}</div>
          </div>
        `,
        toast: true,
        position: "top-end",
        showConfirmButton: true,
        confirmButtonText: "Xem đơn hàng",
        showCancelButton: true,
        cancelButtonText: "Đóng",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
        timer: 10000,
        timerProgressBar: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/admin/order/edit/${data.orderId}`;
        }
      });
    }

    // Tăng badge trên chuông thông báo Header
    const bellBadge = document.querySelector("#notificationBtn .badge");
    if (bellBadge) {
      let bCount = parseInt(bellBadge.textContent) || 0;
      bellBadge.textContent = bCount + 1;
      bellBadge.style.display = "flex";
    }

    // Thêm mục hủy vào dropdown
    const notifList = document.querySelector(".notification-list");
    if (notifList) {
      const li = document.createElement("li");
      li.className = "notification-item unread";
      li.style.cursor = "pointer";
      li.onclick = () => window.location.href = `/admin/order/edit/${data.orderId}`;
      li.innerHTML = `
        <div class="notif-icon bg-rose" style="background: #f43f5e; color: #fff;">
          <i class="fa-solid fa-ban"></i>
        </div>
        <div class="notif-content">
          <p class="notif-text"><strong>#${data.orderCode}</strong>: Khách đã hủy đơn (${data.cancelReason || "Đổi ý"})</p>
          <span class="notif-time" style="color: #e11d48; font-weight: 600;">Vừa xong</span>
        </div>
      `;
      notifList.insertBefore(li, notifList.firstChild);
    }
  });

  // Tương tác Dropdown Chuông thông báo
  document.addEventListener("DOMContentLoaded", function () {
    const notifBtn = document.getElementById("notificationBtn");
    const notifDropdown = document.getElementById("notificationDropdown");

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const isShow = notifDropdown.classList.contains("show");
        notifDropdown.classList.toggle("show");
        notifBtn.setAttribute("aria-expanded", !isShow);

        // Đặt badge về 0 khi đã mở xem
        const bellBadge = notifBtn.querySelector(".badge");
        if (bellBadge && !isShow) {
          bellBadge.textContent = "0";
          bellBadge.style.display = "none";
        }
      });

      document.addEventListener("click", function (e) {
        if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
          notifDropdown.classList.remove("show");
          notifBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
  });
})();
