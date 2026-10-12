// ==========================================
// CẤU HÌNH WEBSITE & TRANG CHỦ (TABS CONTROLLER & HERO SLIDES)
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
  // ------------------------------------------
  // 1. QUẢN LÝ CHUYỂN TABS CẤU HÌNH
  // ------------------------------------------
  const tabsNav = document.getElementById("websiteTabsNav");
  if (tabsNav) {
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
  }

  // ------------------------------------------
  // 2. QUẢN LÝ DYNAMIC HERO SLIDES BANNER TRANG CHỦ
  // ------------------------------------------
  const heroSlidesContainer = document.getElementById("hero-slides-container");
  const btnAddHeroSlide = document.getElementById("btnAddHeroSlide");

  if (heroSlidesContainer) {
    // Hàm gắn sự kiện xem trước & xóa ảnh cho từng upload wrapper
    function bindUploadWrapper(wrapper) {
      if (!wrapper) return;
      const input = wrapper.querySelector("[upload-image-input]");
      const label = wrapper.querySelector("[upload-image-label]");
      const previewContainer = wrapper.querySelector("[upload-image-preview-container]");
      const previewImage = wrapper.querySelector("[upload-image-preview]");
      const btnRemove = wrapper.querySelector("[button-remove-image]");
      const formGroup = wrapper.closest(".form-group");
      const hiddenInput = formGroup ? formGroup.querySelector("input[type='hidden']") : null;

      if (input && previewImage) {
        input.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            previewImage.src = URL.createObjectURL(file);
            if (label) label.classList.add("hidden");
            if (previewContainer) previewContainer.classList.remove("hidden");
          }
        });
      }

      if (btnRemove) {
        btnRemove.addEventListener("click", () => {
          if (input) input.value = "";
          if (previewImage) previewImage.src = "";
          if (previewContainer) previewContainer.classList.add("hidden");
          if (label) label.classList.remove("hidden");
          if (hiddenInput) hiddenInput.value = "";
        });
      }
    }

    // Gắn sự kiện cập nhật tiêu đề xem trước trực tiếp khi gõ
    function bindTitleLivePreview(card) {
      if (!card) return;
      const titleInput = card.querySelector("input[name='heroSlide_title']");
      const previewEl = card.querySelector(".slide-title-preview");
      if (titleInput && previewEl) {
        titleInput.addEventListener("input", function () {
          const rawText = this.value.replace(/<[^>]*>/g, " ").trim();
          previewEl.textContent = rawText || "Banner Slide";
        });
      }
    }

    // Đánh lại số thứ tự và tên input file cho tất cả các slide
    function reindexSlides() {
      const cards = heroSlidesContainer.querySelectorAll(".hero-slide-config-card");
      cards.forEach((card, idx) => {
        card.setAttribute("data-slide-index", idx);

        // Số thứ tự slide
        const numBadge = card.querySelector(".slide-number-badge");
        if (numBadge) {
          numBadge.textContent = `Slide #${idx + 1}`;
        }

        // Cập nhật nút xóa slide: Slide đầu tiên chỉ có nút xóa nếu tổng số slide > 1
        const header = card.querySelector(".slide-card-header");
        let delBtn = card.querySelector(".btn-delete-slide");

        if (idx === 0) {
          if (cards.length === 1 && delBtn) {
            delBtn.remove();
          } else if (cards.length > 1 && !delBtn && header) {
            const btn = document.createElement("button");
            btn.className = "btn-delete-slide";
            btn.type = "button";
            btn.title = "Xóa slide này";
            btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Xóa slide';
            header.appendChild(btn);
          }
        }

        // Cập nhật tên và ID của các input file và label tương ứng
        const bgInput = card.querySelector(".hidden-input[id^='slide-bg-']");
        const bgLabel = card.querySelector(".upload-box[for^='slide-bg-']");
        if (bgInput) {
          bgInput.id = `slide-bg-${idx}`;
          bgInput.name = `heroSlide_image_${idx}`;
        }
        if (bgLabel) {
          bgLabel.setAttribute("for", `slide-bg-${idx}`);
        }

        const scInput = card.querySelector(".hidden-input[id^='slide-showcase-']");
        const scLabel = card.querySelector(".upload-box[for^='slide-showcase-']");
        if (scInput) {
          scInput.id = `slide-showcase-${idx}`;
          scInput.name = `heroSlide_showcaseImage_${idx}`;
        }
        if (scLabel) {
          scLabel.setAttribute("for", `slide-showcase-${idx}`);
        }
      });
    }

    // Khởi tạo cho các slide đã có sẵn trong DOM
    const initialCards = heroSlidesContainer.querySelectorAll(".hero-slide-config-card");
    initialCards.forEach((card) => {
      bindTitleLivePreview(card);
      // Đảm bảo nút remove-image trên các card hiện tại cũng xóa hidden input
      card.querySelectorAll("[button-remove-image]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const group = btn.closest(".form-group");
          const hiddenInput = group ? group.querySelector("input[type='hidden']") : null;
          if (hiddenInput) hiddenInput.value = "";
        });
      });
    });

    // Bắt sự kiện xóa slide (Ủy quyền sự kiện)
    heroSlidesContainer.addEventListener("click", function (e) {
      const deleteBtn = e.target.closest(".btn-delete-slide");
      if (!deleteBtn) return;

      const card = deleteBtn.closest(".hero-slide-config-card");
      if (!card) return;

      if (confirm("Bạn có chắc chắn muốn xóa slide banner này không?")) {
        card.style.transition = "all 0.3s ease";
        card.style.opacity = "0";
        card.style.transform = "scale(0.96)";
        setTimeout(() => {
          card.remove();
          reindexSlides();
        }, 300);
      }
    });

    // Bắt sự kiện thêm slide mới
    if (btnAddHeroSlide) {
      btnAddHeroSlide.addEventListener("click", function () {
        const currentCount = heroSlidesContainer.querySelectorAll(".hero-slide-config-card").length;
        const newIndex = currentCount;

        const newCard = document.createElement("div");
        newCard.className = "hero-slide-config-card";
        newCard.setAttribute("data-slide-index", newIndex);
        newCard.innerHTML = `
          <div class="slide-card-header">
            <div class="slide-card-title">
              <span class="slide-number-badge">Slide #${newIndex + 1}</span>
              <strong class="slide-title-preview">Slide Mới</strong>
            </div>
            <button class="btn-delete-slide" type="button" title="Xóa slide này">
              <i class="fa-solid fa-trash-can"></i> Xóa slide
            </button>
          </div>
          <div class="slide-card-body">
            <div class="slide-section-label">
              <i class="fa-solid fa-align-left"></i>
              <span>1. Nội dung thông điệp thể thao (Bên trái)</span>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Dòng chữ nổi bật (Badge)</label>
                <input class="form-control" type="text" name="heroSlide_badge" value="⚡ PHONG ĐỘ ĐỈNH CAO" placeholder="Ví dụ: ⚡ BST MỚI NHẤT" />
              </div>
              <div class="form-group">
                <label>Tiêu đề chính (Title)</label>
                <input class="form-control" type="text" name="heroSlide_title" value="CHINH PHỤC<br>ĐỈNH VINH QUANG" placeholder="Ví dụ: BỨT PHÁ<br>MỌI GIỚI HẠN" />
              </div>
            </div>
            <div class="form-group">
              <label>Đoạn giới thiệu ngắn (Description)</label>
              <textarea class="form-control" name="heroSlide_desc" rows="2" placeholder="Ví dụ: Trải nghiệm đẳng cấp với bộ sưu tập thể thao chính hãng mới nhất...">Đồng hành cùng đam mê thể thao bất tận. Chất liệu thoáng khí siêu nhẹ, co giãn 4 chiều hỗ trợ vận động đỉnh cao.</textarea>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Nút chính (Button 1)</label>
                <input class="form-control" type="text" name="heroSlide_btnText" value="Xem Ngay" placeholder="Ví dụ: Khám Phá Ngay" />
              </div>
              <div class="form-group">
                <label>Link nút chính (URL 1)</label>
                <input class="form-control" type="text" name="heroSlide_btnLink" value="/product" placeholder="Ví dụ: /product" />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Nút phụ (Button 2 - Tùy chọn)</label>
                <input class="form-control" type="text" name="heroSlide_secBtnText" value="Nhận Mã Giảm Giá" placeholder="Ví dụ: Săn Voucher Hot" />
              </div>
              <div class="form-group">
                <label>Link nút phụ (URL 2)</label>
                <input class="form-control" type="text" name="heroSlide_secBtnLink" value="#voucher-vault" placeholder="Ví dụ: #voucher-vault" />
              </div>
            </div>
            <div class="form-group upload-row">
              <label>Hình ảnh nền banner slide (Khuyên dùng ảnh khổ ngang 1920x800px)</label>
              <input type="hidden" name="heroSlide_currentImage" value="" />
              <div class="upload-image-wrapper" upload-image-wrapper>
                <input class="hidden-input" id="slide-bg-${newIndex}" upload-image-input type="file" name="heroSlide_image_${newIndex}" accept="image/*" />
                <label class="upload-box" for="slide-bg-${newIndex}" upload-image-label>
                  <i class="fa-solid fa-plus"></i>
                </label>
                <div class="image-preview-container hidden" upload-image-preview-container>
                  <img upload-image-preview src="" alt="Xem trước slide ${newIndex + 1}" />
                  <button class="btn-remove-image" type="button" button-remove-image title="Xóa ảnh">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            </div>
            <hr class="slide-inner-divider" />
            <div class="slide-section-label">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <span>2. Thẻ Sản Phẩm / Hot Deal 3D Glassmorphism (Bên phải)</span>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Huy hiệu thẻ (Tag)</label>
                <input class="form-control" type="text" name="heroSlide_showcaseTag" value="🔥 HOT DEAL TUẦN NÀY" placeholder="Ví dụ: 🔥 BEST SELLER" />
              </div>
              <div class="form-group">
                <label>Tên sản phẩm / Tiêu đề thẻ</label>
                <input class="form-control" type="text" name="heroSlide_showcaseTitle" value="Giày Thể Thao Pro Edition" placeholder="Ví dụ: Giày Bóng Đá Nike Mercurial" />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Giá bán hiển thị</label>
                <input class="form-control" type="text" name="heroSlide_showcasePrice" value="1.850.000đ" placeholder="Ví dụ: 1.850.000đ" />
              </div>
              <div class="form-group">
                <label>Giá cũ (Gạch ngang)</label>
                <input class="form-control" type="text" name="heroSlide_showcaseOldPrice" value="2.500.000đ" placeholder="Ví dụ: 2.500.000đ" />
              </div>
            </div>
            <div class="form-group">
              <label>Link xem chi tiết sản phẩm</label>
              <input class="form-control" type="text" name="heroSlide_showcaseLink" value="/product" placeholder="Ví dụ: /product" />
            </div>
            <div class="form-group upload-row">
              <label>Ảnh sản phẩm nổi bật trên thẻ (Ảnh giày, bóng, áo...)</label>
              <input type="hidden" name="heroSlide_currentShowcaseImage" value="" />
              <div class="upload-image-wrapper" upload-image-wrapper>
                <input class="hidden-input" id="slide-showcase-${newIndex}" upload-image-input type="file" name="heroSlide_showcaseImage_${newIndex}" accept="image/*" />
                <label class="upload-box" for="slide-showcase-${newIndex}" upload-image-label>
                  <i class="fa-solid fa-plus"></i>
                </label>
                <div class="image-preview-container hidden" upload-image-preview-container>
                  <img upload-image-preview src="" alt="Xem trước ảnh thẻ nổi bật" />
                  <button class="btn-remove-image" type="button" button-remove-image title="Xóa ảnh">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        heroSlidesContainer.appendChild(newCard);

        // Kích hoạt upload preview cho 2 upload box của card mới
        newCard.querySelectorAll("[upload-image-wrapper]").forEach((wrapper) => {
          bindUploadWrapper(wrapper);
        });

        // Kích hoạt live title sync cho card mới
        bindTitleLivePreview(newCard);

        // Cuộn mượt tới slide mới vừa tạo
        newCard.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }
});
