# 🏆 TITISPORT - WEBSITE THƯƠNG MẠI ĐIỆN TỬ ĐỒ THỂ THAO CAO CẤP

> **Đồ án Thực tập tốt nghiệp**  
> **Sinh viên thực hiện:** Phan Vũ Linh  
> **Mã sinh viên:** `200000xxxx` | **Email:** `linhphanzzz04@gmail.com`  
> **Giảng viên hướng dẫn:** Thầy Nghĩa  
> 🌐 **Live Demo Website:** [https://titisport.onrender.com](https://titisport.onrender.com)  
> 🛡️ **Trang Quản trị (Admin):** [https://titisport.onrender.com/admin](https://titisport.onrender.com/admin)

---

## 📌 GIỚI THIỆU DỰ ÁN

**TITISPORT** là hệ thống website thương mại điện tử chuyên cung cấp trang thiết bị, phụ kiện và trang phục thể thao chính hãng (Bóng đá, Bóng chuyền, Cầu lông, Chạy bộ,...). Hệ thống được xây dựng hoàn chỉnh từ giao diện bán hàng hiện đại dành cho khách hàng (**Storefront Client**) đến trung tâm điều hành chuyên nghiệp dành cho quản trị viên (**Admin Dashboard**).

Dự án áp dụng kiến trúc phân tầng chuẩn mực, giao diện thiết kế theo phong cách hiện đại với **Floating Pill Island Header**, hiệu ứng chuyển động mượt mà, đồng bộ dữ liệu thời gian thực qua **Socket.IO** và tích hợp đa cổng thanh toán trực tuyến (**VNPay**, **ZaloPay**, **VietQR**).

---

## 🚀 CÔNG NGHỆ SỬ DỤNG (TECH STACK)

### 1. Backend & Server
- **Runtime Environment:** [Node.js](https://nodejs.org/) (v20+)
- **Web Framework:** [Express.js](https://expressjs.com/) (v5)
- **Database & ODM:** [MongoDB Atlas](https://www.mongodb.com/atlas) & [Mongoose](https://mongoosejs.com/) (v9)
- **Real-time Engine:** [Socket.IO](https://socket.io/) (Cập nhật đơn hàng & thông báo thời gian thực)
- **Template Engine:** [Pug (Jade)](https://pugjs.org/) (Server-Side Rendering tối ưu SEO và tốc độ tải trang)

### 2. Frontend & Giao diện
- **Ngôn ngữ:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Kiến trúc CSS:** Modular Design System độc lập, biến màu `:root` Design Tokens, hoàn toàn không phụ thuộc TailwindCSS, tối ưu hiệu năng render.
- **Responsive:** Đồng bộ 5 Breakpoint chuẩn quốc tế (`1200px`, `992px`, `768px`, `576px`, `480px`).
- **Thư viện giao diện bổ trợ:** [Swiper.js](https://swiperjs.com/) (Gallery chi tiết sản phẩm), [SweetAlert2](https://sweetalert2.github.io/) (Thông báo Toast & Modal), [Font Awesome 6](https://fontawesome.com/).

### 3. Tích hợp & Dịch vụ bên thứ ba (Integrations)
- **Cổng thanh toán:** 
  - VNPay Sandbox (Cổng thanh toán thẻ ATM / QR-Code)
  - ZaloPay Sandbox (Thanh toán ví điện tử ZaloPay)
  - Chuyển khoản ngân hàng VietQR tự động tạo mã QR chính xác nội dung đơn hàng
- **Lưu trữ đám mây:** [Cloudinary](https://cloudinary.com/) (Quản lý và tối ưu hóa hình ảnh tải lên)
- **Gửi Email tự động:** [Nodemailer](https://nodemailer.com/) (Xác thực OTP, hóa đơn và email thông báo đặt hàng thành công)
- **Soạn thảo nội dung:** [TinyMCE](https://www.tinymce.com/) (Trình soạn thảo văn bản phong phú cho bài viết và mô tả sản phẩm)

---

## ✨ CÁC TÍNH NĂNG NỔI BẬT

### 🛍️ Phân hệ Khách hàng (Client Storefront)
1. **Trang chủ thể thao cao cấp:**
   - **Header treo dạng viên nang (Floating Pill Island):** Giữ cố định thông minh, chống rung lag (zero-jitter), hiệu ứng trong suốt mờ nhẹ sang trọng.
   - **Banner Hero động:** Tích hợp bộ tìm kiếm nhanh và thanh cam kết dịch vụ (**Trust Features Bar**).
   - **Ví Voucher giảm giá (Sport Passbook):** Hiển thị danh sách mã ưu đãi đa dạng màu sắc, hỗ trợ sao chép mã 1-click có thông báo trực quan.
   - **Chiến dịch Flash Sale thời gian thực:** Đồng hồ đếm ngược ngược giờ vàng, thanh tiến độ số lượng mở bán và cập nhật trừ tồn kho tự động.
   - **Bố cục xen kẽ hài hòa (Zebra Striping):** Các phân khu tự động xen kẽ nền Xám - Trắng tinh tế, không gây mỏi mắt.
   - **Đối tác thể thao toàn cầu:** Hiển thị lưới logo chính hãng chuẩn SVG tối giản.
2. **Danh mục & Sản phẩm:**
   - Cây danh mục đa cấp (Đồng phục, Giày, Bóng thi đấu, Phụ kiện...).
   - Lọc sản phẩm theo danh mục, mức giá, sắp xếp theo độ mới/giá tăng/giảm.
   - Trang chi tiết sản phẩm: Thư viện ảnh Swiper Gallery tương tác, chọn biến thể size/màu, kiểm tra tồn kho tức thì.
   - Hệ thống đánh giá & nhận xét đã mua hàng (**Verified Buyer Reviews**) kèm chấm điểm sao và bộ lọc đánh giá.
3. **Giỏ hàng & Đặt hàng:**
   - Thanh tiến độ Freeship thông minh theo giá trị đơn hàng.
   - Áp dụng mã Voucher giảm giá trực tiếp vào đơn hàng.
   - Đa dạng hình thức thanh toán: COD, VNPay, ZaloPay, Chuyển khoản ngân hàng có mã QR.
   - **Theo dõi tiến trình đơn hàng (Realtime Stepper):** Hiển thị trực quan 5 bước xử lý từ Đặt hàng ➔ Xác nhận ➔ Đang giao ➔ Giao thành công / Hủy.
4. **Tài khoản người dùng & Bảo mật:**
   - Đăng ký, đăng nhập bảo mật bằng JWT và mã hóa mật khẩu `bcryptjs` / `md5`.
   - Quên mật khẩu & cấp lại mật khẩu qua mã xác thực OTP gửi về Email.
   - Quản lý hồ sơ cá nhân, lịch sử đơn hàng, xem chi tiết hóa đơn và in hóa đơn trực tiếp.

---

### 🛡️ Phân hệ Quản trị (Admin Dashboard)
1. **Tổng quan hệ thống (Dashboard Analytics):**
   - Thống kê doanh thu theo tháng/ngày, tổng đơn hàng, khách hàng mới và quản trị viên.
   - Biểu đồ tăng trưởng doanh thu trực quan, so sánh các kỳ kinh doanh.
2. **Chiến dịch Flash Sale độc quyền:**
   - Tạo chiến dịch Flash Sale với tiêu đề, thời gian bắt đầu - kết thúc.
   - Popup chọn sản phẩm từ kho nhanh chóng theo danh mục.
   - Công cụ thiết lập hàng loạt: Áp dụng chung % giảm giá và số lượng mở bán cho toàn bộ sản phẩm tham gia.
3. **Quản lý Sản phẩm & Danh mục:**
   - Cấu trúc cây danh mục linh hoạt.
   - Thêm/sửa/xóa sản phẩm, tải ảnh lên Cloudinary, quản lý tồn kho, vị trí hiển thị, trạng thái hoạt động.
   - Thùng rác sản phẩm: Khôi phục hoặc xóa vĩnh viễn.
4. **Quản lý Đơn hàng & Vận chuyển:**
   - Theo dõi trạng thái đơn hàng: Chờ duyệt, Đang giao, Đã giao, Đã hủy.
   - Cập nhật trạng thái thanh toán và thông tin chuyển khoản ngân hàng.
5. **Mã giảm giá (Vouchers):**
   - Thiết lập mã theo %, giảm tiền trực tiếp, số lượng giới hạn, ngày hết hạn.
6. **Phân quyền & Tài khoản (Roles & Permissions):**
   - Phân chia vai trò (Quản trị viên tối cao, Nhân viên bán hàng, Biên tập viên).
   - Bảng ma trận phân quyền chi tiết cho từng chức năng.
7. **Nội dung & Cài đặt:**
   - Quản lý đánh giá khách hàng (Duyệt/Ẩn đánh giá nổi bật).
   - Quản lý bài viết tin tức thể thao, danh mục bài viết.
   - Quản lý thông tin liên hệ gửi từ khách hàng.
   - Cài đặt chung website (Logo, Tên shop, Hotline, Email, Địa chỉ, Bản quyền).

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```bash
project_sport/
├── config/                  # Cấu hình Database, biến hệ thống, Cloudinary
├── controllers/             # Bộ điều khiển Controller
│   ├── admin/               # Logic nghiệp vụ Admin
│   └── client/              # Logic nghiệp vụ Khách hàng
├── helpers/                 # Hàm tiện ích (Gửi mail, Upload Cloudinary, Phân trang, Mã hóa)
├── middlewares/             # Middleware (Xác thực Auth, Alert, Upload)
├── models/                  # Định nghĩa Schema cơ sở dữ liệu MongoDB
├── public/                  # Tài nguyên tĩnh công khai
│   ├── admin/assets/        # CSS, JS, Images của trang Quản trị
│   │   ├── css/style.css    # Master Admin Stylesheet (Cấu trúc 19 phân khu chuẩn)
│   │   └── js/script.js     # Admin interactivity & Socket.IO
│   └── client/assets/       # CSS, JS, Images của trang Khách hàng
│       ├── css/style.css    # Master Client Stylesheet (Cấu trúc 21 phân khu chuẩn)
│       └── js/script.js     # Client interactivity & Dynamic UI
├── routes/                  # Định tuyến ứng dụng
│   ├── admin/               # URL Endpoints Admin
│   └── client/              # URL Endpoints Khách hàng
├── views/                   # Giao diện Pug Templates
│   ├── admin/               # Template giao diện Admin
│   └── client/              # Template giao diện Khách hàng
├── .env.example             # Mẫu file biến môi trường
├── index.js                 # Entry point khởi chạy ứng dụng
├── package.json             # Danh sách dependencies & scripts
└── README.md                # Tài liệu hướng dẫn dự án
```

---

## ⚙️ HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN LOCAL

### 1. Yêu cầu môi trường
- [Node.js](https://nodejs.org/) phiên bản `>= 18.x` hoặc mới hơn.
- Trình quản lý gói `npm` (đi kèm Node.js).
- Một tài khoản cơ sở dữ liệu [MongoDB Atlas](https://www.mongodb.com/atlas) (hoặc MongoDB cài cục bộ).

### 2. Tải mã nguồn về máy
```bash
git clone https://github.com/PhanVuLinh/website_DoTheThao.git
cd website_DoTheThao
```

### 3. Cài đặt các thư viện phụ thuộc
*Lưu ý: Dự án sử dụng cờ `--legacy-peer-deps` để đảm bảo tương thích hoàn hảo giữa các phiên bản Cloudinary:*
```bash
npm install --legacy-peer-deps
```

### 4. Cấu hình biến môi trường (`.env`)
Tạo một file `.env` tại thư mục gốc của dự án với nội dung mẫu sau:

```env
PORT=3000
NODE_ENV=development

# Database MongoDB Atlas
DATABASE=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/sport_management?retryWrites=true&w=majority

# Cloudinary Storage
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API=your_api_key
CLOUDINARY_SECRET=your_api_secret

# Cấu hình gửi Mail (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Cổng thanh toán ZaloPay Sandbox
ZALOPAY_APPID=2553
ZALOPAY_KEY1=your_zalopay_key1
ZALOPAY_KEY2=your_zalopay_key2
ZALOPAY_DOMAIN=https://sb-openapi.zalopay.vn

# Cổng thanh toán VNPay Sandbox
VNPAY_CODE=your_tmn_code
VNPAY_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Đường dẫn Website (cho webhook & callback thanh toán)
DOMAIN_WEBSITE=http://localhost:3000

# JSON Web Token & Session
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
SESSION_SECRET=PPCCLLAABB001
```

### 5. Khởi chạy ứng dụng
- **Chế độ phát triển (Development):**
```bash
npm start
```
- **Chế độ máy chủ chuẩn (Production):**
```bash
node index.js
```

### 6. Truy cập hệ thống
- **Giao diện Khách hàng:** `http://localhost:3000`
- **Giao diện Quản trị:** `http://localhost:3000/admin`
- *(Tài khoản Admin mặc định có thể đăng ký trực tiếp hoặc kích hoạt trong bảng Quản trị viên)*.

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI ONLINE (DEPLOYMENT)

Hệ thống đã được thiết kế sẵn sàng cho việc triển khai trên các nền tảng đám mây hiện đại:

1. **Nền tảng:** [Render.com](https://render.com) (Web Service Node.js).
2. **Cấu hình Build & Start trên Render:**
   - **Build Command:** `npm install --legacy-peer-deps`
   - **Start Command:** `node index.js`
3. **Mẹo chống ngủ đông 24/7:**
   - Tạo monitor miễn phí trên [UptimeRobot](https://uptimerobot.com) với chu kỳ Ping `5 minutes` trỏ về link `https://titisport.onrender.com`.
   - Giúp server Render luôn thức, phản hồi nhanh chóng mà không gặp độ trễ cold-start.

---

## 👨‍💻 THÔNG TIN TÁC GIẢ & BẢN QUYỀN

- **Họ và tên:** Phan Vũ Linh
- **GitHub:** [@PhanVuLinh](https://github.com/PhanVuLinh)
- **Email:** [linhphanzzz04@gmail.com](mailto:linhphanzzz04@gmail.com)
- **Đề tài:** Xây dựng website thương mại điện tử chuyên kinh doanh đồ thể thao (Thực tập tốt nghiệp).

*Copyright © 2026 Phan Vũ Linh. All Rights Reserved.*
