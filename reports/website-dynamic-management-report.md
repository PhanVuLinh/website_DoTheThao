# BÁO CÁO NÂNG CẤP HỆ THỐNG QUẢN LÝ ĐỘNG WEBSITE & TRANG CHỦ

**Dự án:** Hệ thống Thương Mại Điện Tử Đồ Thể Thao (`project_sport`)  
**Nhánh thực hiện:** `feature/commercial-ecommerce-upgrade`  
**Ngày hoàn thành:** 09/10/2026  
**Người thực hiện:** Antigravity AI Assistant  

---

## 1. TỔNG QUAN YÊU CẦU & BỐI CẢNH

Trước đợt nâng cấp, website vẫn còn nhiều thành phần thông tin quan trọng bị **cố định trong mã nguồn**, người quản trị chưa thể tự đổi qua giao diện, bao gồm:
- Thông tin liên hệ ở đầu trang (Hotline, Email, Địa chỉ, Giờ mở cửa).
- Nội dung Banner chính ở đầu trang chủ (Nhãn thông điệp, Tiêu đề, Mô tả, Nút bấm mua sắm và liên kết chuyển trang).
- 4 Cam kết dịch vụ & Chính sách bán hàng với khách hàng.
- Banner quảng cáo khuyến mãi giữa trang chủ (Tiêu đề, mô tả ưu đãi, hình ảnh và liên kết).
- Toàn bộ thông tin chân trang (Footer), dòng chữ bản quyền, giấy phép kinh doanh / mã số thuế.
- Các liên kết mạng xã hội (Facebook, Instagram, TikTok, YouTube, Zalo) và Nút liên hệ nhanh.
- Cấu hình hiển thị trang web trên công cụ tìm kiếm Google (SEO Title, Description, Keywords).
- Chưa có trang liên hệ chuyên biệt (`/contact`) kèm bản đồ chỉ đường Google Maps.

**Mục tiêu đã giải quyết:**
Trao toàn quyền cho **Quản trị viên (Chủ cửa hàng)** để có thể tùy biến, cập nhật 100% nội dung hiển thị của website và trang chủ trực tiếp từ giao diện Admin một cách dễ dàng, trực quan, không cần biết lập trình, tự động cập nhật ngay lập tức đến người mua sắm.

---

## 2. NÂNG CẤP DỮ LIỆU LƯU TRỮ (DATABASE)

### 2.1. Bổ sung các trường quản lý cho Cửa Hàng (`models/setting-website-info.model.js`)

Mô hình dữ liệu cài đặt website đã được mở rộng toàn diện với các trường phục vụ kinh doanh:

```javascript
const settingwebsiteInfoSchema = new mongoose.Schema(
  {
    // 1. Nhận diện thương hiệu & Thông tin liên hệ
    websiteName: String,       // Tên cửa hàng / Thương hiệu (VD: TitiSport)
    slogan: String,            // Khẩu hiệu của cửa hàng
    phone: String,             // Số điện thoại tư vấn
    hotline: String,           // Hotline hỗ trợ khách hàng
    email: String,             // Email chăm sóc khách hàng
    address: String,           // Địa chỉ cửa hàng
    workingHours: String,      // Giờ mở cửa (VD: 08:00 - 22:00)
    aboutShort: String,        // Giới thiệu ngắn về cửa hàng ở chân trang
    copyright: String,         // Dòng chữ bản quyền ở chân trang
    businessLicense: String,   // GPKD / Mã số thuế
    mapIframe: String,         // Mã nhúng bản đồ Google Maps
    logo: String,              // Ảnh Logo cửa hàng
    favicon: String,           // Biểu tượng website trên trình duyệt

    // 2. Kênh mạng xã hội & Tư vấn
    facebook: String,          // Link Facebook Fanpage
    instagram: String,         // Link Instagram
    tiktok: String,            // Link TikTok
    youtube: String,           // Link YouTube
    zalo: String,              // Số điện thoại / Link Zalo

    // 3. Banner Chính Trang Chủ (Đầu trang)
    heroImage: String,         // Hình ảnh banner chính
    heroBadge: String,         // Nhãn nổi bật trên banner (VD: THẾ GIỚI ĐỒ THỂ THAO CHÍNH HÃNG)
    heroTitle: String,         // Tiêu đề chính của banner
    heroDescription: String,   // Đoạn mô tả giới thiệu
    heroBtnText: String,       // Tên nút bấm xem hàng (VD: Khám Phá Ngay)
    heroBtnLink: String,       // Đường dẫn khi khách bấm nút (VD: /product)

    // 4. Banner Khuyến Mãi (Giữa trang chủ)
    promoBannerImage: String,  // Hình ảnh banner khuyến mãi
    promoBannerTitle: String,  // Tiêu đề chương trình khuyến mãi
    promoBannerSubtitle: String,// Mô tả chi tiết ưu đãi
    promoBannerLink: String,   // Đường dẫn khi bấm vào banner

    // 5. Chính sách & Cam kết với khách hàng
    trustBadge1_title: String, // Tiêu đề cam kết 1 (Giao hàng)
    trustBadge1_desc: String,  // Mô tả cam kết 1
    trustBadge2_title: String, // Tiêu đề cam kết 2 (Chính hãng)
    trustBadge2_desc: String,  // Mô tả cam kết 2
    trustBadge3_title: String, // Tiêu đề cam kết 3 (Đổi trả)
    trustBadge3_desc: String,  // Mô tả cam kết 3
    trustBadge4_title: String, // Tiêu đề cam kết 4 (Hỗ trợ)
    trustBadge4_desc: String,  // Mô tả cam kết 4

    // 6. Tối ưu tìm kiếm Google (SEO)
    metaTitle: String,         // Tiêu đề trang hiển thị trên Google
    metaDescription: String,   // Đoạn mô tả hiển thị trên Google
    metaKeywords: String,      // Từ khóa tìm kiếm liên quan
  },
  {
    timestamps: true,
  }
);
```

### 2.2. Nâng cấp Danh mục Liên Hệ Khách Hàng (`models/contact.model.js`)

Mở rộng để tiếp nhận thông tin từ cả **Đăng ký nhận ưu đãi qua email** và **Khách hàng gửi yêu cầu tư vấn**:

```javascript
const contactSchema = new mongoose.Schema(
  {
    fullName: String, // Họ và tên khách hàng
    email: String,    // Email liên hệ
    phone: String,    // Số điện thoại liên hệ
    content: String,  // Nội dung lời nhắn / Câu hỏi tư vấn
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);
```

---

## 3. GIAO DIỆN QUẢN TRỊ ADMIN (PHÂN CHIA 7 TAB TIỆN DỤNG)

File giao diện cấu hình: `views/admin/pages/website-info.pug`  
Được thiết kế giao diện theo dạng **7 Thẻ phân hệ (Tabs)** gọn gàng, thao tác lưu giữ vị trí làm việc thông minh:

1. **1. Thông Tin Cửa Hàng:** Tên shop, Slogan, Hotline, Điện thoại, Email, Giờ làm việc, Địa chỉ, Logo và Biểu tượng Favicon với ảnh xem trước trực quan.
2. **2. Banner Trang Chủ:** Dòng chữ nổi bật, Tiêu đề chính, Đoạn giới thiệu, Tên nút bấm, Đường dẫn liên kết, và Hình ảnh banner lớn.
3. **3. Chính Sách & Cam Kết:** 4 tiêu chí chất lượng tạo dựng niềm tin (Giao hàng hỏa tốc, 100% chính hãng, Đổi trả 30 ngày, Tư vấn tận tâm).
4. **4. Banner Khuyến Mãi:** Quảng bá sự kiện giảm giá đặc biệt giữa trang chủ (Tiêu đề, tóm tắt ưu đãi, hình ảnh và đường dẫn).
5. **5. Mạng Xã Hội & Tư Vấn:** Kết nối các kênh Facebook, Instagram, TikTok, YouTube và Zalo OA.
6. **6. Chân Trang Website:** Giới thiệu ngắn về cửa hàng, thông tin bản quyền và mã số thuế / giấy phép kinh doanh.
7. **7. Tối Ưu SEO & Bản Đồ:** Tiêu đề và mô tả hiển thị trên Google, từ khóa tìm kiếm, cùng ô dán mã nhúng bản đồ Google Maps với hướng dẫn chi tiết.

---

## 4. HIỂN THỊ ĐỒNG BỘ PHÍA KHÁCH HÀNG (CLIENT)

### 4.1. Thanh điều hướng & Đầu trang (`views/client/partials/header.pug`)
- Hiển thị đầy đủ Hotline, Email, Địa chỉ, Giờ mở cửa tự động từ cơ sở dữ liệu.
- Logo cửa hàng tự động hiển thị ảnh hoặc chuyển sang kiểu chữ thương hiệu sang trọng khi chưa đăng tải ảnh.
- Menu điều hướng có sẵn mục "Liên Hệ" dẫn đến trang chăm sóc khách hàng.

### 4.2. Trang Chủ Bán Hàng (`views/client/pages/home.pug`)
- **Banner chính đầu trang:** Hiển thị trọn vẹn hình ảnh, thông điệp và nút mua sắm do Admin quản lý.
- **Chính sách & Cam kết:** 4 khối cam kết chất lượng đổi mới linh hoạt theo cài đặt.
- **Banner khuyến mãi:** Nổi bật giữa trang, điều hướng khách hàng tới đúng danh mục sản phẩm giảm giá.
- **Kho Voucher:** Trình bày mã ưu đãi rõ ràng, thân thiện, dễ sao chép chỉ với 1 thao tác bấm.

### 4.3. Chân trang (`views/client/partials/footer.pug`)
- Ô đăng ký nhận bản tin ưu đãi gắn liền tên thương hiệu.
- Logo và phần giới thiệu ngắn về cửa hàng.
- Các biểu tượng mạng xã hội chỉ xuất hiện khi có cấu hình đường dẫn.
- Thông tin liên hệ, bản quyền và thông tin pháp lý được đồng bộ đầy đủ.

### 4.4. Nút Liên Hệ Nhanh (`views/client/partials/box-contact.pug`)
- Nút gọi nhanh kết nối trực tiếp đến Hotline cửa hàng.
- Nút Zalo, Facebook mở nhanh hộp thoại trò chuyện tư vấn với shop.

### 4.5. Tối ưu tìm kiếm trên Google (`views/client/layouts/default.pug`)
- Tiêu đề và đoạn mô tả trang web hiển thị chuẩn đẹp mắt trên kết quả tìm kiếm Google.
- Biểu tượng Favicon hiển thị đồng bộ trên thanh tab trình duyệt của khách hàng.

### 4.6. Trang Liên Hệ & Bản Đồ (`views/client/pages/contact.pug`)
- Thiết kế 2 cột trực quan:
  - Cột 1: Thông tin nhanh (Hotline, Email, Giờ mở cửa, Địa chỉ), mạng xã hội và Bản đồ chỉ đường Google Maps.
  - Cột 2: Mẫu gửi tin nhắn liên hệ (Họ tên, Số điện thoại, Email, Nội dung câu hỏi cần tư vấn).
- Tiếp nhận và xử lý tin nhắn an toàn, nhanh chóng.

### 4.7. Danh Sách Liên Hệ Trong Admin (`views/admin/pages/contact-list.pug`)
- Hiển thị rõ ràng Họ tên, Số điện thoại, Email và Nội dung lời nhắn của khách.
- Phân biệt rõ ràng giữa khách đăng ký nhận khuyến mãi và khách gửi yêu cầu tư vấn sản phẩm.


---

## 5. DANH SÁCH FILE THAY ĐỔI & BỔ SUNG

| STT | Đường dẫn File | Loại thay đổi | Mô tả |
|:---:|---|:---:|---|
| 1 | `models/setting-website-info.model.js` | Sửa đổi | Mở rộng schema cấu hình website với 25+ trường dữ liệu mới |
| 2 | `models/contact.model.js` | Sửa đổi | Bổ sung `fullName`, `phone`, `content` vào bảng liên hệ |
| 3 | `controllers/admin/setting.controller.js` | Kiểm tra | Xác nhận lưu dữ liệu tự động cho các trường mới |
| 4 | `views/admin/pages/website-info.pug` | Viết lại | Master Configuration Panel với 7 Tab trực quan, sạch CSS/JS inline |
| 5 | `public/admin/assets/js/website-info.js` | **Tạo mới** | Module JS điều khiển chuyển tab và lưu trạng thái sessionStorage |
| 6 | `public/admin/assets/css/style.css` | Mở rộng | Bổ sung mục 17: Cấu hình Tabs Admin & Bảng liên hệ |
| 7 | `views/admin/pages/contact-list.pug` | Cải tiến | Hiển thị chi tiết khách hàng và tin nhắn tư vấn bằng CSS class |
| 8 | `controllers/admin/contact.controller.js` | Cải tiến | Mở rộng tìm kiếm đa trường (name, phone, email, content) |
| 9 | `controllers/client/contact.controller.js` | Cải tiến | Thêm hàm `index` (GET /contact) và xử lý form gửi tin nhắn |
| 10 | `routes/client/contact.route.js` | Sửa đổi | Đăng ký route GET `/contact` |
| 11 | `views/client/pages/contact.pug` | **Tạo mới** | Giao diện trang Liên hệ (100% CSS class, không inline) |
| 12 | `public/client/assets/css/style.css` | Mở rộng | Bổ sung khối CSS trang Liên hệ & Logo fallback |
| 13 | `public/client/assets/js/order-success.js` | **Tạo mới** | Module JS theo dõi trạng thái đơn hàng thời gian thực qua Socket.IO |
| 14 | `views/client/pages/order-success.pug` | Tối ưu | Tách toàn bộ JS inline và CSS inline sang file riêng |
| 15 | `views/client/pages/home.pug` | Cải tiến | Chuyển đổi toàn bộ nút CTA, 4 cam kết, banner khuyến mãi sang DB |
| 16 | `views/client/layouts/default.pug` | Cải tiến | Nhúng SEO Meta Tags, Open Graph và Title động từ DB |
| 17 | `views/client/partials/header.pug` | Cải tiến | Hiển thị thông tin liên hệ động, logo động, bật menu Liên Hệ |
| 18 | `views/client/partials/footer.pug` | Cải tiến | Đồng bộ toàn bộ thông tin thương hiệu, mạng xã hội, pháp lý |
| 19 | `views/client/partials/box-contact.pug` | Cải tiến | Box liên hệ nổi kết nối trực tiếp với thông tin cấu hình DB |
| 20 | `middlewares/client/setting.middleware.js` | Cải tiến | Bổ sung fallback an toàn chống crash trang khi chưa có bản ghi |
| 21 | `controllers/admin/order.controller.js` | Sửa lỗi | Đặt `res.render` ngoài vòng lặp trong trang thùng rác đơn hàng |
| 22 | `views/admin/partials/no-access.pug` | **Tạo mới** | Template dùng chung hiển thị thông báo "Truy cập bị từ chối" (DRY) |
| 23 | Toàn bộ 38 trang admin (`views/admin/pages/*.pug`) | Tối ưu | Gom toàn bộ khối thông báo từ chối truy cập về `include ../partials/no-access.pug` |

---

## 6. KẾT LUẬN & KIỂM THỬ

- **Kiểm thử cú pháp Node.js & Pug:** 100% các file JavaScript và Pug templates đã được biên dịch và kiểm tra cú pháp thành công không có lỗi.
- **Tiêu chuẩn mã nguồn (Code Standards):** Đã tách biệt triệt để 100% CSS và JavaScript sang các thư mục `assets/css` và `assets/js` chuyên biệt, hoàn toàn không sử dụng CSS inline hay Script inline.
- **Khả năng quản trị:** Quản trị viên giờ đây nắm toàn quyền quản lý nội dung thương hiệu, marketing và cấu hình hiển thị của website.
- **Nhánh Git:** Toàn bộ công việc nằm trên nhánh `feature/commercial-ecommerce-upgrade`. Sẵn sàng commit khi có chỉ thị từ người dùng.
