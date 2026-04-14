const mongoose = require("mongoose");

const settingwebsiteInfoSchema = new mongoose.Schema(
  {
    websiteName: String,
    phone: String,
    email: String,
    address: String,
    logo: String,
    favicon: String,
  }
);

const SettingWebsiteInfo = mongoose.model("SettingWebsiteInfo", settingwebsiteInfoSchema, "setting-website-info");

module.exports = SettingWebsiteInfo;
