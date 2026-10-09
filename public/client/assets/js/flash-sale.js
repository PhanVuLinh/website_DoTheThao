// ==========================================
// ĐỒNG HỒ ĐẾM NGƯỢC FLASH SALE THỜI GIAN THỰC
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
  const countdownEl = document.getElementById("flashCountdown");
  if (!countdownEl) return;

  const hoursEl = document.getElementById("cdHours");
  const minutesEl = document.getElementById("cdMinutes");
  const secondsEl = document.getElementById("cdSeconds");

  if (!hoursEl || !minutesEl || !secondsEl) return;

  const rawEndDate = countdownEl.getAttribute("data-end");
  let targetTime;

  if (rawEndDate) {
    targetTime = new Date(rawEndDate).getTime();
  }

  // Nếu chưa cấu hình thời gian kết thúc hoặc thời gian trong quá khứ:
  // Thiết lập mặc định đếm ngược đến 23:59:59 của ngày hôm nay
  if (!targetTime || isNaN(targetTime) || targetTime <= Date.now()) {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    targetTime = endOfDay.getTime();
  }

  function formatPad(num) {
    return num < 10 ? "0" + num : num.toString();
  }

  function updateCountdown() {
    const now = Date.now();
    const distance = targetTime - now;

    if (distance <= 0) {
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    const totalHours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    hoursEl.textContent = formatPad(totalHours);
    minutesEl.textContent = formatPad(minutes);
    secondsEl.textContent = formatPad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
