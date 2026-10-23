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

  // ------------------------------------------
  // 3. QUẢN LÝ DYNAMIC AI SPORTS (MÔN THỂ THAO TRỢ LÝ AI)
  // ------------------------------------------
  const aiSportsContainer = document.getElementById("aiSportsContainer");
  const btnAddAiSport = document.getElementById("btnAddAiSport");

  if (aiSportsContainer) {
    function bindSportCardEvents(card) {
      if (!card) return;
      const titleInput = card.querySelector(".sport-title-input");
      const keyInput = card.querySelector(".sport-key-input");
      const iconInput = card.querySelector(".sport-icon-input");
      const heading = card.querySelector(".sport-card-heading");
      const iconEl = card.querySelector(".sport-card-title-group i");

      if (titleInput && heading) {
        titleInput.addEventListener("input", function () {
          heading.textContent = this.value.trim() || "Bộ môn thể thao mới";
          if (keyInput && (!keyInput.value || keyInput.dataset.autoSlug !== "false")) {
            // Tự động tạo slug không dấu từ tên môn nếu admin chưa chủ động gõ key riêng
            const slug = this.value
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-");
            keyInput.value = slug;
          }
        });
      }

      if (keyInput) {
        keyInput.addEventListener("input", function () {
          this.dataset.autoSlug = "false";
        });
      }

      if (iconInput && iconEl) {
        iconInput.addEventListener("input", function () {
          iconEl.className = this.value.trim() || "fa-solid fa-trophy";
        });
      }
    }

    // Gắn sự kiện cho các thẻ đã có sẵn
    aiSportsContainer.querySelectorAll(".ai-sport-admin-card").forEach((card) => {
      bindSportCardEvents(card);
    });

    // Xóa thẻ môn thể thao (Event delegation)
    aiSportsContainer.addEventListener("click", function (e) {
      const btnRemove = e.target.closest(".btn-remove-sport");
      if (btnRemove) {
        const card = btnRemove.closest(".ai-sport-admin-card");
        if (card) {
          const allCards = aiSportsContainer.querySelectorAll(".ai-sport-admin-card");
          if (allCards.length <= 1) {
            if (typeof Swal !== "undefined") {
              Swal.fire({
                icon: "warning",
                title: "Không thể xóa",
                text: "Cần giữ lại ít nhất 1 bộ môn thể thao để Trợ lý AI có thể hoạt động.",
              });
            } else {
              alert("Cần giữ lại ít nhất 1 bộ môn thể thao để Trợ lý AI có thể hoạt động.");
            }
            return;
          }

          if (confirm("Bạn có chắc chắn muốn xóa bộ môn thể thao này khỏi cấu hình AI không?")) {
            card.style.opacity = "0";
            card.style.transform = "scale(0.95)";
            setTimeout(() => {
              card.remove();
            }, 250);
          }
        }
      }
    });

    // Thêm thẻ môn thể thao mới
    if (btnAddAiSport) {
      btnAddAiSport.addEventListener("click", function () {
        const currentCount = aiSportsContainer.querySelectorAll(".ai-sport-admin-card").length;
        const newCard = document.createElement("div");
        newCard.className = "ai-sport-admin-card";
        newCard.setAttribute("data-sport-index", currentCount);

        newCard.innerHTML = `
          <div class="sport-card-header">
            <div class="sport-card-title-group">
              <i class="fa-solid fa-trophy"></i>
              <strong class="sport-card-heading">Bộ môn thể thao mới #${currentCount + 1}</strong>
              <span class="badge badge-secondary ml-2">Mới tạo</span>
            </div>
            <button class="btn-remove-sport" type="button" title="Xóa bộ môn này">
              <i class="fa-solid fa-trash-can"></i>
              Xóa môn này
            </button>
          </div>
          <div class="sport-card-body">
            <div class="form-row-3">
              <div class="form-group">
                <label>Mã định danh (Key không dấu, viết liền/dấu gạch) <span class="text-danger">*</span></label>
                <input class="form-control sport-key-input" type="text" name="aiSport_key" value="" placeholder="Ví dụ: basketball, tennis, swimming..." required />
              </div>
              <div class="form-group">
                <label>Tên bộ môn hiển thị <span class="text-danger">*</span></label>
                <input class="form-control sport-title-input" type="text" name="aiSport_title" value="" placeholder="Ví dụ: Bóng Rổ, Tennis, Bơi Lội..." required />
              </div>
              <div class="form-group">
                <label>Icon FontAwesome</label>
                <input class="form-control sport-icon-input" type="text" name="aiSport_icon" value="fa-solid fa-trophy" placeholder="Ví dụ: fa-solid fa-basketball" />
              </div>
            </div>
            <div class="form-group">
              <label>Mô tả ngắn gọn (Hiển thị trên thẻ chọn của khách)</label>
              <input class="form-control" type="text" name="aiSport_desc" value="" placeholder="Ví dụ: Quả bóng, giày thi đấu, phụ kiện chuyên nghiệp" />
            </div>
            <div class="form-group">
              <label>Từ khóa tìm kiếm sản phẩm trong kho (Cách nhau bởi dấu phẩy) <span class="text-danger">*</span></label>
              <input class="form-control" type="text" name="aiSport_keywords" value="" placeholder="Ví dụ: bóng rổ, giày bóng rổ, spalding, molten" required />
              <p class="form-text text-muted">Khi khách chọn bộ môn này, AI sẽ quét kho hàng với các từ khóa trên để tìm và gợi ý sản phẩm phù hợp ngân sách.</p>
            </div>
            <div class="form-row-3">
              <div class="form-group">
                <label>Lời khuyên Kỹ thuật: Lối chơi TẤN CÔNG (Smash/Bứt tốc)</label>
                <textarea class="form-control" name="aiSport_attackSpecs" rows="2" placeholder="Thông số trang bị phù hợp lối chơi tấn công..."></textarea>
              </div>
              <div class="form-group">
                <label>Lời khuyên Kỹ thuật: Lối chơi TỐC ĐỘ (Phản tạt/Linh hoạt)</label>
                <textarea class="form-control" name="aiSport_speedSpecs" rows="2" placeholder="Thông số trang bị phù hợp lối chơi tốc độ..."></textarea>
              </div>
              <div class="form-group">
                <label>Lời khuyên Kỹ thuật: Lối chơi TOÀN DIỆN (Công thủ linh hoạt)</label>
                <textarea class="form-control" name="aiSport_allroundSpecs" rows="2" placeholder="Thông số trang bị phù hợp lối chơi toàn diện..."></textarea>
              </div>
            </div>
          </div>
        `;

        aiSportsContainer.appendChild(newCard);
        bindSportCardEvents(newCard);
        newCard.scrollIntoView({ behavior: "smooth", block: "center" });

        const firstInput = newCard.querySelector(".sport-title-input");
        if (firstInput) firstInput.focus();
      });
    }
  }

  // ------------------------------------------
  // 4. QUẢN LÝ CHÂN TRANG (FOOTER DYNAMIC COLUMNS & SHOWROOM BRANCHES & MAP)
  // ------------------------------------------
  const footerColsContainer = document.getElementById("footer-columns-container");
  const btnAddFooterCol = document.getElementById("btnAddFooterCol");
  const footerBranchesContainer = document.getElementById("footer-branches-container");
  const btnAddFooterBranch = document.getElementById("btnAddFooterBranch");
  const footerMapIframeInput = document.getElementById("footerMapIframeInput");
  const footerMapPreviewFrame = document.getElementById("footerMapPreviewFrame");
  const formWebsiteInfo = document.getElementById("formWebsiteInfo");

  // Reindex Footer Columns
  function reindexFooterColumns() {
    if (!footerColsContainer) return;
    const cards = footerColsContainer.querySelectorAll(".footer-col-admin-card");
    cards.forEach((card, idx) => {
      card.setAttribute("data-col-index", idx);
      const titleNumber = card.querySelector(".col-card-number");
      if (titleNumber) {
        titleNumber.textContent = `Cột Liên Kết #${idx + 1}`;
      }
    });
  }

  // Reindex Footer Branches
  function reindexFooterBranches() {
    if (!footerBranchesContainer) return;
    const cards = footerBranchesContainer.querySelectorAll(".footer-branch-admin-card");
    cards.forEach((card, idx) => {
      card.setAttribute("data-branch-index", idx);
      const titleNumber = card.querySelector(".branch-card-number");
      if (titleNumber) {
        titleNumber.textContent = `Chi Nhánh #${idx + 1}`;
      }
    });
  }

  // Serialize dynamic footer columns and branches into hidden JSON inputs
  function serializeFooterData() {
    // 1. Footer Columns
    if (footerColsContainer) {
      const columns = [];
      const colCards = footerColsContainer.querySelectorAll(".footer-col-admin-card");
      colCards.forEach((card) => {
        const titleInput = card.querySelector(".col-title-input");
        const title = titleInput ? titleInput.value.trim() : "";
        if (!title) return; // skip untitled

        const links = [];
        const linkRows = card.querySelectorAll(".footer-link-row");
        linkRows.forEach((row) => {
          const textInput = row.querySelector(".link-text-input");
          const urlInput = row.querySelector(".link-url-input");
          const text = textInput ? textInput.value.trim() : "";
          const url = urlInput ? urlInput.value.trim() : "";
          if (text || url) {
            links.push({
              text: text || "Liên kết",
              url: url || "#"
            });
          }
        });

        columns.push({
          title: title,
          links: links
        });
      });

      const hiddenColInput = document.getElementById("footerColumnsJson");
      if (hiddenColInput) {
        hiddenColInput.value = JSON.stringify(columns);
      }
    }

    // 2. Footer Branches
    if (footerBranchesContainer) {
      const branches = [];
      const branchCards = footerBranchesContainer.querySelectorAll(".footer-branch-admin-card");
      branchCards.forEach((card, idx) => {
        const nameInput = card.querySelector(".branch-name-input");
        const addressInput = card.querySelector(".branch-address-input");
        const phoneInput = card.querySelector(".branch-phone-input");
        const hoursInput = card.querySelector(".branch-hours-input");

        const name = nameInput ? nameInput.value.trim() : "";
        const address = addressInput ? addressInput.value.trim() : "";
        if (!name && !address) return; // skip completely empty cards

        branches.push({
          name: name || `Chi Nhánh #${idx + 1}`,
          address: address || "",
          phone: phoneInput ? phoneInput.value.trim() : "",
          hours: hoursInput ? hoursInput.value.trim() : "08:00 - 21:30",
          isMain: idx === 0
        });
      });

      const hiddenBranchInput = document.getElementById("footerBranchesJson");
      if (hiddenBranchInput) {
        hiddenBranchInput.value = JSON.stringify(branches);
      }
    }
  }

  // Hook into form submit
  if (formWebsiteInfo) {
    formWebsiteInfo.addEventListener("submit", function () {
      serializeFooterData();
    });

    // Also support any external button triggering form submission
    const topSaveBtn = document.querySelector(".website-settings-actions .btn-save-pane");
    if (topSaveBtn) {
      topSaveBtn.onclick = function (e) {
        e.preventDefault();
        serializeFooterData();
        formWebsiteInfo.submit();
      };
    }
  }

  // Add new column button
  if (btnAddFooterCol && footerColsContainer) {
    btnAddFooterCol.addEventListener("click", function () {
      const currentCount = footerColsContainer.querySelectorAll(".footer-col-admin-card").length;
      const newCard = document.createElement("div");
      newCard.className = "footer-col-admin-card";
      newCard.setAttribute("data-col-index", currentCount);
      newCard.innerHTML = `
        <div class="col-card-header">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-table-columns text-primary"></i>
            <strong class="col-card-number">Cột Liên Kết #${currentCount + 1}</strong>
          </div>
          <button class="btn-remove-col" type="button" title="Xóa toàn bộ cột này">
            <i class="fa-solid fa-trash-can me-1"></i> Xóa cột
          </button>
        </div>
        <div class="col-card-body">
          <div class="form-group mb-3">
            <label>Tiêu đề cột (Tên nhóm liên kết)</label>
            <input class="form-control col-title-input" type="text" placeholder="Ví dụ: Về Chúng Tôi, Hỗ Trợ Khách Hàng..." required />
          </div>
          <label class="small fw-bold text-muted mb-2">Danh sách liên kết bên trong cột:</label>
          <div class="footer-links-list">
            <div class="footer-link-row">
              <div class="link-drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
              <input class="form-control form-control-sm link-text-input" type="text" placeholder="Tên liên kết (VD: Giới thiệu shop)" required />
              <input class="form-control form-control-sm link-url-input" type="text" placeholder="Đường dẫn URL (VD: /about)" required />
              <button class="btn-remove-link" type="button" title="Xóa liên kết này"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="footer-link-row">
              <div class="link-drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
              <input class="form-control form-control-sm link-text-input" type="text" placeholder="Tên liên kết (VD: Liên hệ hợp tác)" required />
              <input class="form-control form-control-sm link-url-input" type="text" placeholder="Đường dẫn URL (VD: /contact)" required />
              <button class="btn-remove-link" type="button" title="Xóa liên kết này"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>
          <button class="btn-add-link-to-col" type="button">
            <i class="fa-solid fa-plus me-1"></i> Thêm liên kết vào cột này
          </button>
        </div>
      `;
      footerColsContainer.appendChild(newCard);
      reindexFooterColumns();
      newCard.scrollIntoView({ behavior: "smooth", block: "center" });

      const titleInput = newCard.querySelector(".col-title-input");
      if (titleInput) titleInput.focus();
    });
  }

  // Handle click events inside footer columns container (Remove column, Add link, Remove link)
  if (footerColsContainer) {
    footerColsContainer.addEventListener("click", function (e) {
      // 1. Remove column
      const btnRemoveCol = e.target.closest(".btn-remove-col");
      if (btnRemoveCol) {
        const card = btnRemoveCol.closest(".footer-col-admin-card");
        if (card) {
          if (confirm("Bạn có chắc chắn muốn xóa cột liên kết chân trang này không?")) {
            card.style.transition = "all 0.25s ease";
            card.style.opacity = "0";
            card.style.transform = "scale(0.96)";
            setTimeout(() => {
              card.remove();
              reindexFooterColumns();
            }, 250);
          }
        }
        return;
      }

      // 2. Add link to column
      const btnAddLink = e.target.closest(".btn-add-link-to-col");
      if (btnAddLink) {
        const card = btnAddLink.closest(".footer-col-admin-card");
        const linksList = card ? card.querySelector(".footer-links-list") : null;
        if (linksList) {
          const newRow = document.createElement("div");
          newRow.className = "footer-link-row";
          newRow.innerHTML = `
            <div class="link-drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
            <input class="form-control form-control-sm link-text-input" type="text" placeholder="Tên liên kết..." required />
            <input class="form-control form-control-sm link-url-input" type="text" placeholder="Đường dẫn URL..." required />
            <button class="btn-remove-link" type="button" title="Xóa liên kết này"><i class="fa-solid fa-xmark"></i></button>
          `;
          linksList.appendChild(newRow);
          const firstInput = newRow.querySelector(".link-text-input");
          if (firstInput) firstInput.focus();
        }
        return;
      }

      // 3. Remove link
      const btnRemoveLink = e.target.closest(".btn-remove-link");
      if (btnRemoveLink) {
        const row = btnRemoveLink.closest(".footer-link-row");
        if (row) {
          row.remove();
        }
        return;
      }
    });
  }

  // Add new branch button
  if (btnAddFooterBranch && footerBranchesContainer) {
    btnAddFooterBranch.addEventListener("click", function () {
      const currentCount = footerBranchesContainer.querySelectorAll(".footer-branch-admin-card").length;
      const newCard = document.createElement("div");
      newCard.className = "footer-branch-admin-card";
      newCard.setAttribute("data-branch-index", currentCount);
      newCard.innerHTML = `
        <div class="branch-card-header">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-shop text-success"></i>
            <strong class="branch-card-number">Chi Nhánh #${currentCount + 1}</strong>
          </div>
          <button class="btn-remove-branch" type="button" title="Xóa chi nhánh này">
            <i class="fa-solid fa-trash-can me-1"></i> Xóa chi nhánh
          </button>
        </div>
        <div class="branch-card-body">
          <div class="form-row-2">
            <div class="form-group">
              <label>Tên cơ sở / Showroom</label>
              <input class="form-control branch-name-input" type="text" placeholder="Ví dụ: Showroom Chi Nhánh Mới" required />
            </div>
            <div class="form-group">
              <label>Số điện thoại / Hotline chi nhánh</label>
              <input class="form-control branch-phone-input" type="text" placeholder="Ví dụ: 0987.654.321" />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Địa chỉ chi nhánh</label>
              <input class="form-control branch-address-input" type="text" placeholder="Ví dụ: Số 123 Đường ABC, Quận XYZ, TP.HCM" required />
            </div>
            <div class="form-group">
              <label>Giờ mở cửa hoạt động</label>
              <input class="form-control branch-hours-input" type="text" placeholder="Ví dụ: 08:00 - 21:30 (Cả tuần)" value="08:00 - 21:30 (Cả tuần)" />
            </div>
          </div>
        </div>
      `;
      footerBranchesContainer.appendChild(newCard);
      reindexFooterBranches();
      newCard.scrollIntoView({ behavior: "smooth", block: "center" });

      const nameInput = newCard.querySelector(".branch-name-input");
      if (nameInput) nameInput.focus();
    });
  }

  // Handle click events inside branches container (Remove branch)
  if (footerBranchesContainer) {
    footerBranchesContainer.addEventListener("click", function (e) {
      const btnRemoveBranch = e.target.closest(".btn-remove-branch");
      if (btnRemoveBranch) {
        const card = btnRemoveBranch.closest(".footer-branch-admin-card");
        if (card) {
          if (confirm("Bạn có chắc chắn muốn xóa chi nhánh cửa hàng này không?")) {
            card.style.transition = "all 0.25s ease";
            card.style.opacity = "0";
            card.style.transform = "scale(0.96)";
            setTimeout(() => {
              card.remove();
              reindexFooterBranches();
            }, 250);
          }
        }
      }
    });
  }

  // Live Google Map Preview
  if (footerMapIframeInput && footerMapPreviewFrame) {
    function updateMapPreview() {
      const rawVal = footerMapIframeInput.value.trim();
      if (!rawVal) {
        footerMapPreviewFrame.innerHTML = `
          <div class="map-placeholder-box">
            <i class="fa-solid fa-map-location-dot"></i>
            <span>Chưa có mã nhúng bản đồ (Sẽ dùng bản đồ tự động theo địa chỉ)</span>
          </div>
        `;
        return;
      }

      if (rawVal.includes("<iframe")) {
        // Adjust width & height to 100% for responsive preview
        let cleanHtml = rawVal.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"');
        footerMapPreviewFrame.innerHTML = cleanHtml;
      } else if (rawVal.startsWith("http://") || rawVal.startsWith("https://")) {
        // If user pasted just a direct URL
        footerMapPreviewFrame.innerHTML = `<iframe src="${rawVal}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
      } else {
        footerMapPreviewFrame.innerHTML = `
          <div class="map-placeholder-box text-danger">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>Mã nhúng không hợp lệ. Vui lòng dán thẻ &lt;iframe&gt; từ Google Maps.</span>
          </div>
        `;
      }
    }

    footerMapIframeInput.addEventListener("input", updateMapPreview);
    footerMapIframeInput.addEventListener("change", updateMapPreview);
  }
});
