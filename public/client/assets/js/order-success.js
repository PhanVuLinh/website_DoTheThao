// ==========================================
// REAL-TIME ORDER TRACKING (SOCKET.IO)
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
  const successWrapper = document.querySelector(".success-wrapper");
  if (!successWrapper) return;

  const currentOrderId = successWrapper.getAttribute("data-order-id");
  if (!currentOrderId) return;

  if (typeof io !== "undefined") {
    const socket = io();

    socket.emit("JOIN_ORDER_ROOM", currentOrderId);

    socket.on("SERVER_UPDATE_ORDER_STATUS", function (data) {
      if (data.orderId === currentOrderId) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "info",
            title: "Trạng thái đơn hàng cập nhật!",
            text: "Đơn hàng #" + data.orderCode + " đã chuyển sang: " + data.statusName,
            toast: true,
            position: "top-end",
            timer: 5000,
            showConfirmButton: false,
          });
        }
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    });
  }
});
