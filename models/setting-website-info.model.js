const mongoose = require("mongoose");

const settingwebsiteInfoSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản & thương hiệu
    websiteName: String,
    slogan: String,
    phone: String,
    hotline: String,
    email: String,
    address: String,
    workingHours: String,
    aboutShort: String,
    copyright: String,
    businessLicense: String,
    mapIframe: String,
    logo: String,
    favicon: String,

    // Mạng xã hội
    facebook: String,
    instagram: String,
    tiktok: String,
    youtube: String,
    zalo: String,

    // Banner & Hero Revolution Trang Chủ
    heroImage: String,
    heroBadge: String,
    heroTitle: String,
    heroDescription: String,
    heroBtnText: String,
    heroBtnLink: String,

    // Banner Quảng Cáo Khuyến Mãi (Giữa trang)
    promoBannerImage: String,
    promoBannerTitle: String,
    promoBannerSubtitle: String,
    promoBannerLink: String,

    // 4 Cam kết dịch vụ (Trust Features)
    trustBadge1_title: String,
    trustBadge1_desc: String,
    trustBadge2_title: String,
    trustBadge2_desc: String,
    trustBadge3_title: String,
    trustBadge3_desc: String,
    trustBadge4_title: String,
    trustBadge4_desc: String,

    // SEO Meta
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,

    // Cấu hình Flash Sale & Đồng hồ đếm ngược
    flashSaleActive: {
      type: Boolean,
      default: true,
    },
    flashSaleTitle: {
      type: String,
      default: "SĂN HÀNG GIÁ TỐT",
    },
    flashSaleBadge: {
      type: String,
      default: "GIỜ VÀNG GIÁ SỐC",
    },
    flashSaleSubTitle: {
      type: String,
      default: "ƯU ĐÃI CÓ HẠN",
    },
    flashSaleDesc: {
      type: String,
      default: "Giày thi đấu & trang bị thể thao tuyển chọn giảm sâu số lượng có hạn.",
    },
    flashSaleEndTime: Date,
    flashSaleLink: {
      type: String,
      default: "/product",
    },

    // 2 Tab Môn Thể Thao nổi bật trên Trang Chủ (Sports Hub)
    sportsTab1_id: String,
    sportsTab2_id: String,

    // Cổng thanh toán
    paymentCodActive: {
      type: Boolean,
      default: true,
    },
    paymentZaloPayActive: {
      type: Boolean,
      default: true,
    },
    paymentVnPayActive: {
      type: Boolean,
      default: true,
    },
    paymentMomoActive: {
      type: Boolean,
      default: false,
    },
    paymentBankActive: {
      type: Boolean,
      default: true,
    },
    bankName: {
      type: String,
      default: "Vietcombank",
    },
    bankAccountNumber: {
      type: String,
      default: "1029384756",
    },
    bankAccountName: {
      type: String,
      default: "TITISPORT STORE",
    },
    bankQrCode: String,

    // Chính sách phí vận chuyển
    shippingFee: {
      type: Number,
      default: 30000,
    },
    freeShippingThreshold: {
      type: Number,
      default: 500000,
    },
  },
  {
    timestamps: true,
  },
);

const SettingWebsiteInfo = mongoose.model(
  "SettingWebsiteInfo",
  settingwebsiteInfoSchema,
  "setting-website-info",
);

module.exports = SettingWebsiteInfo;
