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
