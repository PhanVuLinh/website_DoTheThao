const SettingWebsiteInfo = require("../../models/setting-website-info.model");

const defaultFooterColumns = [
  {
    title: "Hỗ Trợ Khách Hàng",
    links: [
      { text: "Hướng dẫn mua hàng & thanh toán", url: "/policy/huong-dan-mua-hang" },
      { text: "Chính sách đổi trả 7 ngày", url: "/policy/chinh-sach-doi-tra" },
      { text: "Chính sách bảo hành chính hãng", url: "/policy/chinh-sach-bao-hanh" },
      { text: "Vận chuyển & Giao nhận hỏa tốc", url: "/policy/chinh-sach-van-chuyen" },
      { text: "Chính sách bảo mật thông tin", url: "/policy/chinh-sach-bao-mat" },
      { text: "Liên hệ tư vấn trực tiếp", url: "/contact" },
    ],
  },
  {
    title: "Về TitiSport",
    links: [
      { text: "Câu chuyện thương hiệu TitiSport", url: "/about" },
      { text: "Cam kết 100% hàng chính hãng", url: "/policy/cam-ket-chinh-hang" },
      { text: "Hệ thống Showroom toàn quốc", url: "/contact" },
      { text: "Tuyển dụng & Cơ hội nghề nghiệp", url: "/contact" },
      { text: "Tin tức & Cẩm nang thể thao", url: "/article" },
      { text: "Hợp tác kinh doanh & Đại lý", url: "/contact" },
    ],
  },
  {
    title: "Danh Mục Nổi Bật",
    links: [
      { text: "Giày bóng đá cỏ nhân tạo", url: "/product?category=giay-da-bong" },
      { text: "Áo đấu câu lạc bộ mới nhất", url: "/product?category=quan-ao-bong-da" },
      { text: "Vợt & Phụ kiện cầu lông", url: "/product?category=cau-long" },
      { text: "Quả bóng đá thi đấu FIFA", url: "/product?category=bong-da" },
      { text: "Phụ kiện & Trang bị bảo hộ", url: "/product" },
    ],
  },
];

const defaultFooterBranches = [
  {
    name: "Showroom Chính (Trụ sở TP.HCM)",
    address: "63 Đường Ấp 1, Xã Vĩnh Lộc, Huyện Bình Chánh, TP. Hồ Chí Minh",
    phone: "0987.654.321",
    hours: "08:00 - 21:30 (Thứ 2 - Chủ Nhật)",
    mapUrl: "https://maps.google.com/?q=63+Đường+Ấp+1+Vĩnh+Lộc+Hồ+Chí+Minh",
    isMain: true,
  },
  {
    name: "Showroom Cơ Sở 2 (Hà Nội)",
    address: "186 Đường Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội",
    phone: "0912.345.678",
    hours: "08:30 - 21:00 (Thứ 2 - Chủ Nhật)",
    mapUrl: "https://maps.google.com/?q=186+Cầu+Giấy+Hà+Nội",
    isMain: false,
  },
];

module.exports.websiteInfo = async (req, res, next) => {
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  const info = settingWebsiteInfo ? settingWebsiteInfo.toObject() : {};

  if (!info.footerColumns || info.footerColumns.length === 0) {
    info.footerColumns = defaultFooterColumns;
  }
  if (!info.footerBranches || info.footerBranches.length === 0) {
    info.footerBranches = defaultFooterBranches;
  }
  if (!info.footerMapIframe && info.mapIframe) {
    info.footerMapIframe = info.mapIframe;
  }

  res.locals.settingWebsiteInfo = info;
  next();
};
