const mongoose = require("mongoose");

const settingwebsiteInfoSchema = new mongoose.Schema(
  {
    websiteName: String,
    phone: String,
    email: String,
    address: String,
    logo: String,
    favicon: String,
    heroImage: String,       
    heroBadge: String,       
    heroTitle: String,       
    heroDescription: String,
    promoBannerImage: String,
  }
);

const SettingWebsiteInfo = mongoose.model("SettingWebsiteInfo", settingwebsiteInfoSchema, "setting-website-info");

module.exports = SettingWebsiteInfo;
