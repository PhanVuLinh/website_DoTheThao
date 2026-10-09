# BÁO CÁO NÂNG CẤP HỆ THỐNG QUẢN LÝ ĐỘNG WEBSITE & TRANG CHỦ

**Dự án:** Hệ thống Thương Mại Điện Tử Đồ Thể Thao (`project_sport`)  
**Nhánh thực hiện:** `feature/commercial-ecommerce-upgrade`  
**Ngày hoàn thành:** 09/10/2026  
**Người thực hiện:** Antigravity AI Assistant  

---

## 1. TỔNG QUAN YÊU CẦU & BỐI CẢNH

Trước đợt nâng cấp, website vẫn còn nhiều thành phần thông tin quan trọng bị **gán cứng (hardcoded)** trực tiếp trong mã nguồn HTML/Pug, bao gồm:
- Thông tin liên hệ ở Header (Hotline, Email, Địa chỉ, Giờ mở cửa).
- Nội dung Hero Banner ở đầu trang chủ (Badge, Tiêu đề, Mô tả, Nút bấm kêu gọi hành động CTA và liên kết dẫn đến trang sản phẩm).
- 4 Thẻ Cam kết uy tín & Lợi thế thương hiệu (Trust Features).
- Banner Quảng cáo khuyến mãi giữa trang chủ (Tiêu đề, phụ đề, ảnh banner và link).
- Toàn bộ thông tin chân trang (Footer), bản quyền (Copyright), giấy phép kinh doanh.
- Các liên kết mạng xã hội (Facebook, Instagram, TikTok, YouTube, Zalo) ở Footer và Hộp liên hệ nổi (Floating Contact Box).
- Cấu hình thẻ SEO Meta (Title, Description, Keywords, Open Graph).
- Chưa có trang liên hệ chuyên biệt (`/contact`) tích hợp bản đồ Google Maps động.

**Mục tiêu đã giải quyết:**
Trao toàn quyền tối cao cho **Quản trị viên (Admin)** để có thể tùy biến, cập nhật 100% nội dung hiển thị của website và trang chủ trực tiếp từ giao diện Admin mà không cần can thiệp vào mã nguồn, tự động đồng bộ tức thời đến toàn bộ người dùng cuối.

---

## 2. NÂNG CẤP DATABASE SCHEMA (MONGODB)

### 2.1. Bổ sung trường cho Model `SettingWebsiteInfo` (`models/setting-website-info.model.js`)

Mô hình dữ liệu cài đặt website đã được mở rộng toàn diện với các trường dữ liệu:

```javascript
const settingwebsiteInfoSchema = new mongoose.Schema(
  {
    // 1. Nhận diện thương hiệu & Thông tin doanh nghiệp
    websiteName: String,       // Tên website / Thương hiệu (VD: TitiSport)
    slogan: String,            // Slogan khẩu hiệu thương hiệu
    phone: String,             // Số điện thoại liên hệ
    hotline: String,           // Hotline hỗ trợ 24/7
    email: String,             // Email chăm sóc khách hàng
    address: String,           // Địa chỉ cửa hàng / Trụ sở chính
    workingHours: String,      // Giờ làm việc mở cửa (VD: 08:00 - 22:00)
    aboutShort: String,        // Giới thiệu ngắn về cửa hàng ở chân trang
    copyright: String,         // Dòng chữ bản quyền ở Footer
    businessLicense: String,   // GPKD / Mã số thuế
    mapIframe: String,         // Mã nhúng iframe Google Maps
    logo: String,              // Link ảnh Logo (Upload Cloudinary)
    favicon: String,           // Link ảnh Favicon (Upload Cloudinary)

    // 2. Mạng xã hội & Kênh kết nối
    facebook: String,          // URL Facebook Fanpage
    instagram: String,         // URL Instagram
    tiktok: String,            // URL TikTok
    youtube: String,           // URL YouTube
    zalo: String,              // URL / Số điện thoại Zalo OA

    // 3. Hero Banner Trang Chủ (Đầu trang)
    heroImage: String,         // Ảnh nền banner chính (Upload Cloudinary)
    heroBadge: String,         // Huy hiệu nổi bật (VD: THẾ GIỚI ĐỒ THỂ THAO CHÍNH HÃNG)
    heroTitle: String,         // Tiêu đề chính Banner (Hỗ trợ <br>)
    heroDescription: String,   // Đoạn mô tả chi tiết
    heroBtnText: String,       // Chữ trên nút kêu gọi (VD: Khám Phá Ngay)
    heroBtnLink: String,       // Đường dẫn khi bấm nút (VD: /product)

    // 4. Banner Quảng Cáo Khuyến Mãi (Giữa trang chủ)
    promoBannerImage: String,  // Ảnh banner quảng cáo giữa trang
    promoBannerTitle: String,  // Tiêu đề banner khuyến mãi
    promoBannerSubtitle: String,// Phụ đề banner khuyến mãi
    promoBannerLink: String,   // Liên kết khi bấm vào banner

    // 5. 4 Cam kết dịch vụ & Lợi thế thương hiệu (Trust Features)
    trustBadge1_title: String, // Tiêu đề cam kết 1 (Vận chuyển)
    trustBadge1_desc: String,  // Mô tả cam kết 1
    trustBadge2_title: String, // Tiêu đề cam kết 2 (Chính hãng)
    trustBadge2_desc: String,  // Mô tả cam kết 2
    trustBadge3_title: String, // Tiêu đề cam kết 3 (Đổi trả)
    trustBadge3_desc: String,  // Mô tả cam kết 3
    trustBadge4_title: String, // Tiêu đề cam kết 4 (Tư vấn)
    trustBadge4_desc: String,  // Mô tả cam kết 4

    // 6. Cấu hình SEO Meta Tags
    metaTitle: String,         // Tiêu đề SEO mặc định
    metaDescription: String,   // Mô tả SEO mặc định
    metaKeywords: String,      // Từ khóa SEO
  },
  {
    timestamps: true,
  }
);
```

### 2.2. Nâng cấp Model `Contact` (`models/contact.model.js`)

Mở rộng để hỗ trợ song song cả **Đăng ký nhận bản tin khuyến mãi (Newsletter)** và **Gửi thư liên hệ / yêu cầu tư vấn chuyên sâu** từ khách hàng:

```javascript
const contactSchema = new mongoose.Schema(
  {
    fullName: String, // Họ và tên khách hàng
    email: String,    // Email liên hệ
    phone: String,    // Số điện thoại
    content: String,  // Nội dung tin nhắn / Yêu cầu tư vấn
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

## 3. GIAO DIỆN QUẢN TRỊ ADMIN (MASTER CONFIGURATION PANEL)

File giao diện cấu hình: `views/admin/pages/website-info.pug`  
Được thiết kế lại theo tiêu chuẩn hiện đại, phân chia trực quan thành **7 phân hệ**:

1. **Thông tin doanh nghiệp & Nhận diện thương hiệu:** Tên shop, Slogan, Hotline, Điện thoại, Email, Giờ làm việc, Địa chỉ, Upload Logo và Favicon xem trước tức thì (Preview).
2. **Hero Banner Trang Chủ:** Cấu hình Badge, Tiêu đề chính, Đoạn mô tả, Chữ trên nút CTA, Link nút CTA, và Upload ảnh Banner chính.
3. **4 Cam Kết & Lợi Thế Thương Hiệu (Trust Cards):** Bảng lưới 2x2 cho phép quản trị viên nhập tiêu đề và đoạn văn mô tả cam kết của shop (Giao hàng, Nguồn gốc xuất xứ, Chính sách đổi trả, Đội ngũ hỗ trợ).
4. **Banner Quảng Cáo Khuyến Mãi (Giữa trang):** Quản lý ảnh Banner khuyến mãi, tiêu đề giật tít, phụ đề và liên kết điều hướng.
5. **Mạng Xã Hội & Kênh Liên Hệ Nổi:** Cấu hình link Facebook, Instagram, TikTok, YouTube, Zalo OA.
6. **Chân Trang (Footer) & Pháp Lý:** Giới thiệu ngắn về cửa hàng, dòng chữ Bản quyền (Copyright), Giấy phép kinh doanh / Mã số thuế.
7. **Cấu Hình SEO Meta & Bản Đồ Google Maps:** Meta Title, Meta Description, Meta Keywords, và ô nhập mã nhúng iframe Google Maps.

---

## 4. ĐỒNG BỘ DỮ LIỆU ĐỘNG TRÊN PHÍA CLIENT (NGƯỜI DÙNG CUỐI)

### 4.1. Thanh điều hướng & Header (`views/client/partials/header.pug`)
- Top bar hiển thị tự động Hotline, Email, Địa chỉ, Giờ mở cửa lấy từ `settingWebsiteInfo`.
- Logo thương hiệu lấy từ Cloudinary; nếu chưa tải ảnh lên sẽ tự động hiển thị chữ thương hiệu sang trọng.
- Bật liên kết trang `/contact` trực tiếp trên menu điều hướng chính.

### 4.2. Trang Chủ (`views/client/pages/home.pug`)
- **Hero Revolution:** Tiêu đề, Badge, Mô tả, Nút bấm CTA "Khám Phá Ngay" và Link dẫn sản phẩm đều được render động từ DB với fallback an toàn.
- **Trust Cards (4 cam kết):** Nội dung 4 thẻ đổi mới linh hoạt theo cấu hình của Admin.
- **Banner Khuyến Mãi Cinematic:** Tự động hiển thị hình ảnh, tiêu đề và liên kết do Admin cấu hình.
- **Thương hiệu đối tác & Testimonials:** Tự động gắn tên thương hiệu vào các tiêu đề và thẻ đối tác.

### 4.3. Chân trang (`views/client/partials/footer.pug`)
- Newsletter mời đăng ký kèm tên thương hiệu động.
- Logo và phần giới thiệu ngắn (About Short) lấy từ cài đặt.
- Các icon mạng xã hội chỉ xuất hiện khi Admin có cấu hình link (ẩn tự động nếu để trống).
- Thông tin Hotline, Địa chỉ, Email, Giờ mở cửa, Bản quyền và GPKD đồng bộ 100%.

### 4.4. Hộp Liên Hệ Nổi (`views/client/partials/box-contact.pug`)
- Nút gọi nhanh `tel:` liên kết trực tiếp tới Hotline cửa hàng.
- Nút Zalo, Facebook, Instagram, TikTok mở trực tiếp kênh của cửa hàng theo cấu hình.

### 4.5. Thẻ SEO & Header Layout (`views/client/layouts/default.pug`)
- Thẻ `<title>` tự động ưu tiên Tiêu đề bài/trang -> Meta Title Admin -> Tên website -> Fallback chuẩn.
- Thẻ `<meta name="description">` và `<meta name="keywords">` chèn tự động.
- Thẻ Open Graph (`og:title`, `og:description`, `og:image`) phục vụ chia sẻ liên kết mạng xã hội chuẩn SEO.
- Thẻ `<link rel="icon">` hiển thị Favicon tải lên từ Admin.

### 4.6. Trang Liên Hệ Mới (`views/client/pages/contact.pug`)
- Thiết kế 2 cột chuẩn UI/UX:
  - Cột trái: Thẻ thông tin nhanh (Hotline, Email, Giờ mở cửa, Địa chỉ), các kênh mạng xã hội chính thức, và bản đồ Google Maps nhúng từ DB qua iframe.
  - Cột phải: Form liên hệ chuyên nghiệp (Họ tên, SĐT, Email, Nội dung cần tư vấn).
- Tích hợp controller xử lý tại `controllers/client/contact.controller.js` với route GET `/contact` và POST `/contact/create`.

### 4.7. Quản lý Khách Hàng Liên Hệ ở Admin (`views/admin/pages/contact-list.pug`)
- Mở rộng bảng quản trị: hiển thị đầy đủ Họ tên, Số điện thoại, Email, Nội dung lời nhắn của khách hàng.
- Nâng cấp bộ lọc tìm kiếm hỗ trợ tìm theo cả Họ tên, Số điện thoại, Email và Nội dung tin nhắn.

---

## 5. DANH SÁCH FILE THAY ĐỔI & BỔ SUNG

| STT | Đường dẫn File | Loại thay đổi | Mô tả |
|:---:|---|:---:|---|
| 1 | `models/setting-website-info.model.js` | Sửa đổi | Mở rộng schema cấu hình website với 25+ trường dữ liệu mới |
| 2 | `models/contact.model.js` | Sửa đổi | Bổ sung `fullName`, `phone`, `content` vào bảng liên hệ |
| 3 | `controllers/admin/setting.controller.js` | Kiểm tra | Xác nhận lưu dữ liệu tự động cho các trường mới |
| 4 | `views/admin/pages/website-info.pug` | Viết lại | Master Configuration Panel với 7 nhóm cấu hình trực quan |
| 5 | `views/admin/pages/contact-list.pug` | Cải tiến | Hiển thị chi tiết khách hàng và tin nhắn tư vấn |
| 6 | `controllers/admin/contact.controller.js` | Cải tiến | Mở rộng tìm kiếm đa trường (name, phone, email, content) |
| 7 | `controllers/client/contact.controller.js` | Cải tiến | Thêm hàm `index` (GET /contact) và xử lý form gửi tin nhắn |
| 8 | `routes/client/contact.route.js` | Sửa đổi | Đăng ký route GET `/contact` |
| 9 | `views/client/pages/contact.pug` | **Tạo mới** | Giao diện trang Liên hệ với Google Maps động và Form tư vấn |
| 10 | `views/client/pages/home.pug` | Cải tiến | Chuyển đổi toàn bộ nút CTA, 4 cam kết, banner khuyến mãi sang DB |
| 11 | `views/client/layouts/default.pug` | Cải tiến | Nhúng SEO Meta Tags, Open Graph và Title động từ DB |
| 12 | `views/client/partials/header.pug` | Cải tiến | Hiển thị thông tin liên hệ động, logo động, bật menu Liên Hệ |
| 13 | `views/client/partials/footer.pug` | Cải tiến | Đồng bộ toàn bộ thông tin thương hiệu, mạng xã hội, pháp lý |
| 14 | `views/client/partials/box-contact.pug` | Cải tiến | Box liên hệ nổi kết nối trực tiếp với thông tin cấu hình DB |
| 15 | `middlewares/client/setting.middleware.js` | Cải tiến | Bổ sung fallback an toàn chống crash trang khi chưa có bản ghi |
| 16 | `controllers/admin/order.controller.js` | Sửa lỗi | Đặt `res.render` ngoài vòng lặp trong trang thùng rác đơn hàng |

---

## 6. KẾT LUẬN & KIỂM THỬ

- **Kiểm thử cú pháp Node.js & Pug:** 100% các file JavaScript và Pug templates đã được biên dịch và kiểm tra cú pháp thành công không có lỗi.
- **Khả năng quản trị:** Quản trị viên giờ đây nắm toàn quyền quản lý nội dung thương hiệu, marketing và cấu hình hiển thị của website.
- **Nhánh Git:** Toàn bộ công việc đã được lưu trữ an toàn trên nhánh `feature/commercial-ecommerce-upgrade`.
