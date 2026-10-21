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

    // Danh sách các Slide Banner Hero (Carousel nhiều ảnh & thẻ nổi bật)
    heroSlides: [
      {
        badge: String,
        title: String,
        description: String,
        btnText: String,
        btnLink: String,
        secondaryBtnText: String,
        secondaryBtnLink: String,
        image: String,
        showcaseTag: String,
        showcaseTitle: String,
        showcasePrice: String,
        showcaseOldPrice: String,
        showcaseImage: String,
        showcaseLink: String,
      },
    ],

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

    // ==========================================
    // CẤU HÌNH TRỢ LÝ AI TƯ VẤN THỂ THAO (AI SPORT LAB)
    // ==========================================
    aiLabActive: {
      type: Boolean,
      default: true,
    },
    aiLabTitle: {
      type: String,
      default: "Trợ Lý AI Tư Vấn Vợt & Giày Thể Thao",
    },
    aiLabTag: {
      type: String,
      default: "TITISPORT AI LAB™",
    },
    aiLabVersion: {
      type: String,
      default: "v3.5 SPORT PHYSICS",
    },
    aiLabDescription: {
      type: String,
      default: "Phân tích thể trạng, lực cổ tay và lối chơi để đề xuất trang bị thể thao tối ưu từ kho hàng.",
    },
    aiEngineMode: {
      type: String,
      default: "hybrid", // "rules" | "api" | "hybrid"
    },
    aiApiKey: {
      type: String,
      default: "",
    },
    aiSystemPrompt: {
      type: String,
      default: "Bạn là Chuyên gia Khoa học Thể thao hàng đầu tại TitiSport. Hãy đối chiếu lối chơi, lực cổ tay và ngân sách để đưa ra lời khuyên kỹ thuật chuyên sâu về điểm cân bằng (mm), độ dẻo đũa vợt, trọng lượng (U), độ căng cước (lbs) hoặc công nghệ đệm giày bảo vệ khớp tối ưu nhất.",
    },
    // Danh sách bộ môn thể thao được cấu hình động bởi Admin
    aiSports: [
      {
        key: String,
        title: String,
        desc: String,
        icon: String,
        keywords: String,
        attackSpecs: String,
        speedSpecs: String,
        allroundSpecs: String,
      },
    ],
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
