// ==========================================
// CẤU HÌNH WEBSITE & TRANG CHỦ (TABS CONTROLLER)
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
  const tabsNav = document.getElementById("websiteTabsNav");
  if (!tabsNav) return;

  const tabBtns = tabsNav.querySelectorAll(".tab-nav-btn");
  const tabPanes = document.querySelectorAll(".settings-tab-pane");
  const nextBtns = document.querySelectorAll("[data-next]");

  function activateTab(tabId) {
    if (!tabId) return;
    const targetBtn = tabsNav.querySelector(`.tab-nav-btn[data-tab="${tabId}"]`);
    const targetPane = document.getElementById(tabId);

    if (targetBtn && targetPane) {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));

      targetBtn.classList.add("active");
      targetPane.classList.add("active");

      // Lưu tab vào sessionStorage để giữ trạng thái sau khi reload hoặc lưu form
      sessionStorage.setItem("activeWebsiteInfoTab", tabId);

      // Cập nhật URL Hash không làm reload trang
      if (history.replaceState) {
        history.replaceState(null, null, "#" + tabId);
      }
    }
  }

  // Bắt sự kiện click vào các nút Tab
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const target = this.getAttribute("data-tab");
      activateTab(target);
    });
  });

  // Bắt sự kiện click vào các nút "Tiếp tục / Quay lại"
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const target = this.getAttribute("data-next");
      activateTab(target);

      // Cuộn nhẹ lên đầu khu vực cấu hình
      const headerEl = document.querySelector(".website-settings-header");
      if (headerEl) {
        headerEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Khôi phục tab từ URL Hash hoặc sessionStorage khi vào trang
  const currentHash = window.location.hash
    ? window.location.hash.replace("#", "")
    : null;
  const savedTab = sessionStorage.getItem("activeWebsiteInfoTab");
  const initialTab = currentHash || savedTab || "tab-brand";

  activateTab(initialTab);
});
