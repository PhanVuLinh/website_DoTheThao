const SettingWebsiteInfo = require("../../models/setting-website-info.model");

module.exports.websiteInfo = async (req, res, next) => {
  try {
    const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
    res.locals.settingWebsiteInfo = settingWebsiteInfo || {};
  } catch (error) {
    res.locals.settingWebsiteInfo = {};
  }
  next();
};
