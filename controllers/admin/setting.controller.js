const moment = require("moment");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const SettingWebsiteInfo = require("../../models/setting-website-info.model");
const Category = require("../../models/category.model");
const variableCongfig = require("../../config/variable");
const permissonConfig = require("../../config/permission");
const passwordHelper = require("../../helpers/password.helper");

const paginationHelper = require("../../helpers/pagination.helper");

module.exports.list = (req, res) => {
  res.render("admin/pages/setting-list.pug", {
    title: "Danh sách cài đặt",
  });
};

const defaultAiSports = [
  {
    key: "badminton",
    title: "Cầu Lông",
    desc: "Vợt đập cầu, cước trợ lực, giày di chuyển linh hoạt",
    icon: "fa-solid fa-feather-pointed",
    keywords: "vợt, cầu lông, yonex, lining, victor, nanoflare, axforce, astrox, giày cầu lông",
    attackSpecs: "Vợt nặng đầu (300-308mm), thân cứng (Stiff), 3U/4U, cước 11-12kg (24-26.5 lbs)",
    speedSpecs: "Vợt nhẹ đầu (285-293mm), thân dẻo thoát tay, 4U/5U, cước 10.5-11.5kg (23-25 lbs)",
    allroundSpecs: "Vợt cân bằng (290-296mm), thân trung bình, 4U, cước 10.5-11.0kg (23-24.5 lbs)",
  },
  {
    key: "football",
    title: "Bóng Đá",
    desc: "Giày đinh TF sân cỏ nhân tạo, bóng thi đấu, phụ kiện",
    icon: "fa-solid fa-futbol",
    keywords: "bóng đá, đá banh, giày đá bóng, tf, kamito, mizuno, wika, quả bóng, sân cỏ",
    attackSpecs: "Form ôm mũi nhọn, đinh TF cao su đúc đa hướng bám sân, tăng lực sút mu & bứt tốc",
    speedSpecs: "Trọng lượng siêu nhẹ (<200g), upper microfiber cảm giác bóng thật chân",
    allroundSpecs: "Đệm EVA lót giảm chấn bảo vệ khớp gối & gót chân, upper êm ái kiểm soát bóng",
  },
  {
    key: "volleyball",
    title: "Bóng Chuyền",
    desc: "Giày bật nhảy giảm chấn, bảo hộ khớp gối thi đấu",
    icon: "fa-solid fa-volleyball",
    keywords: "bóng chuyền, giày bóng chuyền, asics, mizuno, đệm bật, bóng thi đấu",
    attackSpecs: "Đệm gót Power Cushion / Gel siêu êm trợ lực bật cao dứt điểm trên lưới",
    speedSpecs: "Đế ma sát đa hướng, cổ thấp linh hoạt cứu bóng và di chuyển nhanh",
    allroundSpecs: "Khung chống lật cổ chân TPU, bảo vệ an toàn khớp gối khi tiếp đất sàn cứng",
  },
  {
    key: "running",
    title: "Chạy Bộ & Gym",
    desc: "Giày đệm êm hoàn trả năng lượng, trang phục nén cơ",
    icon: "fa-solid fa-person-running",
    keywords: "chạy, running, giày chạy, marathon, gym, thể thao, quần áo thể thao",
    attackSpecs: "Đế carbon đàn hồi bứt phá tốc độ, hoàn trả lực tối đa cho pace cao",
    speedSpecs: "Trọng lượng lông vũ, upper lưới thoáng khí giảm nhiệt độ bàn chân",
    allroundSpecs: "Đệm bọt êm dày Max Cushion chống chấn thương khớp gối & gót chân cự ly dài",
  },
  {
    key: "pickleball",
    title: "Pickleball & Tennis",
    desc: "Vợt pickleball & giày tennis bám sân",
    icon: "fa-solid fa-table-tennis-paddle-ball",
    keywords: "pickleball, tennis, vợt pickleball, giày tennis, joola, head",
    attackSpecs: "Mặt Carbon T700 thô, lõi polymer 13-14mm smash uy lực & độ xoáy topspin cực cao",
    speedSpecs: "Trọng lượng nhẹ 7.5-7.8 oz, vung vợt chớp nhoáng tại vùng kitchen",
    allroundSpecs: "Lõi dày 16mm giảm chấn, sweet spot rộng kiểm soát dink êm ái toàn diện",
  },
];

module.exports.websiteInfo = async (req, res) => {
  let settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  if (!settingWebsiteInfo) {
    settingWebsiteInfo = new SettingWebsiteInfo({
      aiSports: defaultAiSports,
    });
    await settingWebsiteInfo.save();
  } else if (!settingWebsiteInfo.aiSports || settingWebsiteInfo.aiSports.length === 0) {
    settingWebsiteInfo.aiSports = defaultAiSports;
    await SettingWebsiteInfo.updateOne(
      { _id: settingWebsiteInfo._id },
      { aiSports: defaultAiSports }
    );
  }

  const parentCategories = await Category.find({
    deleted: false,
    parent_id: "",
  }).select("title _id").sort({ position: 1 });

  res.render("admin/pages/website-info.pug", {
    title: "Thông tin website",
    settingWebsiteInfo: settingWebsiteInfo,
    parentCategories: parentCategories,
  });
};

module.exports.websiteInfoPatch = async (req, res) => {
  const fileMap = {};
  if (Array.isArray(req.files)) {
    req.files.forEach((file) => {
      fileMap[file.fieldname] = file.path;
    });
  } else if (req.files) {
    Object.keys(req.files).forEach((key) => {
      if (req.files[key] && req.files[key][0]) {
        fileMap[key] = req.files[key][0].path;
      }
    });
  }

  if (fileMap.logo) {
    req.body.logo = fileMap.logo;
  } else {
    delete req.body.logo;
  }
  if (fileMap.favicon) {
    req.body.favicon = fileMap.favicon;
  } else {
    delete req.body.favicon;
  }
  if (fileMap.heroImage) {
    req.body.heroImage = fileMap.heroImage;
  } else {
    delete req.body.heroImage;
  }
  if (fileMap.promoBannerImage) {
    req.body.promoBannerImage = fileMap.promoBannerImage;
  } else {
    delete req.body.promoBannerImage;
  }
  if (fileMap.bankQrCode) {
    req.body.bankQrCode = fileMap.bankQrCode;
  } else {
    delete req.body.bankQrCode;
  }

  // Xử lý danh sách Hero Carousel Slides (Nhiều Banner Trang Chủ)
  if (req.body.heroSlide_title !== undefined) {
    const titles = Array.isArray(req.body.heroSlide_title)
      ? req.body.heroSlide_title
      : [req.body.heroSlide_title];
    const badges = Array.isArray(req.body.heroSlide_badge)
      ? req.body.heroSlide_badge
      : [req.body.heroSlide_badge];
    const descs = Array.isArray(req.body.heroSlide_desc)
      ? req.body.heroSlide_desc
      : [req.body.heroSlide_desc];
    const btnTexts = Array.isArray(req.body.heroSlide_btnText)
      ? req.body.heroSlide_btnText
      : [req.body.heroSlide_btnText];
    const btnLinks = Array.isArray(req.body.heroSlide_btnLink)
      ? req.body.heroSlide_btnLink
      : [req.body.heroSlide_btnLink];
    const secBtnTexts = Array.isArray(req.body.heroSlide_secBtnText)
      ? req.body.heroSlide_secBtnText
      : [req.body.heroSlide_secBtnText];
    const secBtnLinks = Array.isArray(req.body.heroSlide_secBtnLink)
      ? req.body.heroSlide_secBtnLink
      : [req.body.heroSlide_secBtnLink];
    const currentImages = Array.isArray(req.body.heroSlide_currentImage)
      ? req.body.heroSlide_currentImage
      : [req.body.heroSlide_currentImage];
    const showcaseTags = Array.isArray(req.body.heroSlide_showcaseTag)
      ? req.body.heroSlide_showcaseTag
      : [req.body.heroSlide_showcaseTag];
    const showcaseTitles = Array.isArray(req.body.heroSlide_showcaseTitle)
      ? req.body.heroSlide_showcaseTitle
      : [req.body.heroSlide_showcaseTitle];
    const showcasePrices = Array.isArray(req.body.heroSlide_showcasePrice)
      ? req.body.heroSlide_showcasePrice
      : [req.body.heroSlide_showcasePrice];
    const showcaseOldPrices = Array.isArray(req.body.heroSlide_showcaseOldPrice)
      ? req.body.heroSlide_showcaseOldPrice
      : [req.body.heroSlide_showcaseOldPrice];
    const showcaseLinks = Array.isArray(req.body.heroSlide_showcaseLink)
      ? req.body.heroSlide_showcaseLink
      : [req.body.heroSlide_showcaseLink];
    const currentShowcaseImages = Array.isArray(req.body.heroSlide_currentShowcaseImage)
      ? req.body.heroSlide_currentShowcaseImage
      : [req.body.heroSlide_currentShowcaseImage];

    const parsedSlides = [];
    for (let i = 0; i < titles.length; i++) {
      if (!titles[i] && !currentImages[i] && !fileMap[`heroSlide_image_${i}`]) {
        continue;
      }
      const slideImg = fileMap[`heroSlide_image_${i}`] || currentImages[i] || "";
      const scImg = fileMap[`heroSlide_showcaseImage_${i}`] || currentShowcaseImages[i] || "";

      parsedSlides.push({
        badge: badges[i] || "",
        title: titles[i] || "",
        description: descs[i] || "",
        btnText: btnTexts[i] || "Khám Phá Ngay",
        btnLink: btnLinks[i] || "/product",
        secondaryBtnText: secBtnTexts[i] || "",
        secondaryBtnLink: secBtnLinks[i] || "",
        image: slideImg,
        showcaseTag: showcaseTags[i] || "",
        showcaseTitle: showcaseTitles[i] || "",
        showcasePrice: showcasePrices[i] || "",
        showcaseOldPrice: showcaseOldPrices[i] || "",
        showcaseImage: scImg,
        showcaseLink: showcaseLinks[i] || "/product",
      });
    }

    req.body.heroSlides = parsedSlides;

    // Đồng bộ ngược sang các trường hero* gốc để tương thích
    if (parsedSlides.length > 0) {
      req.body.heroBadge = parsedSlides[0].badge;
      req.body.heroTitle = parsedSlides[0].title;
      req.body.heroDescription = parsedSlides[0].description;
      req.body.heroBtnText = parsedSlides[0].btnText;
      req.body.heroBtnLink = parsedSlides[0].btnLink;
      if (parsedSlides[0].image) {
        req.body.heroImage = parsedSlides[0].image;
      }
    }
  }

  // Xử lý các trường boolean checkbox
  req.body.flashSaleActive = req.body.flashSaleActive === "on" || req.body.flashSaleActive === "true" || req.body.flashSaleActive === true;
  req.body.paymentCodActive = req.body.paymentCodActive === "on" || req.body.paymentCodActive === "true" || req.body.paymentCodActive === true;
  req.body.paymentZaloPayActive = req.body.paymentZaloPayActive === "on" || req.body.paymentZaloPayActive === "true" || req.body.paymentZaloPayActive === true;
  req.body.paymentVnPayActive = req.body.paymentVnPayActive === "on" || req.body.paymentVnPayActive === "true" || req.body.paymentVnPayActive === true;
  req.body.paymentMomoActive = req.body.paymentMomoActive === "on" || req.body.paymentMomoActive === "true" || req.body.paymentMomoActive === true;
  req.body.paymentBankActive = req.body.paymentBankActive === "on" || req.body.paymentBankActive === "true" || req.body.paymentBankActive === true;

  // Xử lý phí vận chuyển
  if (req.body.shippingFee !== undefined && req.body.shippingFee !== "") {
    req.body.shippingFee = parseInt(req.body.shippingFee, 10);
  }
  if (req.body.freeShippingThreshold !== undefined && req.body.freeShippingThreshold !== "") {
    req.body.freeShippingThreshold = parseInt(req.body.freeShippingThreshold, 10);
  }

  // Xử lý Cấu Hình Trợ Lý AI Thể Thao (AI Sport Lab)
  req.body.aiLabActive = req.body.aiLabActive === "on" || req.body.aiLabActive === "true" || req.body.aiLabActive === true;

  if (req.body.aiSport_key !== undefined) {
    const keys = Array.isArray(req.body.aiSport_key) ? req.body.aiSport_key : [req.body.aiSport_key];
    const titles = Array.isArray(req.body.aiSport_title) ? req.body.aiSport_title : [req.body.aiSport_title];
    const descs = Array.isArray(req.body.aiSport_desc) ? req.body.aiSport_desc : [req.body.aiSport_desc];
    const icons = Array.isArray(req.body.aiSport_icon) ? req.body.aiSport_icon : [req.body.aiSport_icon];
    const keywords = Array.isArray(req.body.aiSport_keywords) ? req.body.aiSport_keywords : [req.body.aiSport_keywords];
    const attackSpecs = Array.isArray(req.body.aiSport_attackSpecs) ? req.body.aiSport_attackSpecs : [req.body.aiSport_attackSpecs];
    const speedSpecs = Array.isArray(req.body.aiSport_speedSpecs) ? req.body.aiSport_speedSpecs : [req.body.aiSport_speedSpecs];
    const allroundSpecs = Array.isArray(req.body.aiSport_allroundSpecs) ? req.body.aiSport_allroundSpecs : [req.body.aiSport_allroundSpecs];

    const parsedSports = [];
    for (let i = 0; i < keys.length; i++) {
      if (!keys[i] && !titles[i]) continue;
      parsedSports.push({
        key: (keys[i] || "").trim().toLowerCase().replace(/\s+/g, "-"),
        title: (titles[i] || "").trim(),
        desc: (descs[i] || "").trim(),
        icon: (icons[i] || "fa-solid fa-trophy").trim(),
        keywords: (keywords[i] || "").trim(),
        attackSpecs: (attackSpecs[i] || "").trim(),
        speedSpecs: (speedSpecs[i] || "").trim(),
        allroundSpecs: (allroundSpecs[i] || "").trim(),
      });
    }
    req.body.aiSports = parsedSports;
  }

  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  if (settingWebsiteInfo) {
    await SettingWebsiteInfo.updateOne(
      { _id: settingWebsiteInfo.id },
      req.body,
    );
  } else {
    const newRecord = new SettingWebsiteInfo(req.body);
    await newRecord.save();
  }

  req.flash("success", "Cập nhật thành công");
  res.redirect(req.get("Referer"));
};

module.exports.accountAdminList = async (req, res) => {
  const find = {
    deleted: false,
  };
  //lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }

  //lọc theo nhóm quyền
  if (req.query.role) {
    find.role_id = req.query.role;
  }

  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [
      { fullName: regexKeyword },
      { email: regexKeyword },
      { phone: regexKeyword },
    ];
  }

  //Phân trang
  const countAccount = await Account.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countAccount,
  );
  //hết Phân trang

  const accountList = await Account.find(find)
    .sort({ createdAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const account of accountList) {
    const role = await Role.findOne({
      deleted: false,
      _id: account.role_id,
    });
    account.role_name = role?.name || "Không có quyền";
  }

  const roleList = await Role.find({
    deleted: false,
  }).select("id name");

  res.render("admin/pages/setting-account-admin-list.pug", {
    title: "Tài khoản quản trị",
    roleList: roleList,
    accountList: accountList,
    pagination: objectPagination,
  });
};

module.exports.accountAdminChangeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "active":
      case "inactive":
        await Account.updateMany(
          { _id: { $in: ids } },
          {
            status: type,
            updatedBy: updatedBy,
            updatedAt: new Date(),
          },
        );
        req.flash("success", `Đã cập nhật trạng thái ${ids.length} tài khoản!`);
        break;

      case "delete-all":
        await Account.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash(
          "success",
          `Đã chuyển ${ids.length} tài khoản vào thùng rác!`,
        );
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
    res.redirect(req.get("Referer"));
  }
};

module.exports.accountAdminCreate = async (req, res) => {
  const roles = await Role.find({
    deleted: false,
  }).select("_id  name");

  res.render("admin/pages/setting-account-admin-create.pug", {
    title: "Tạo tài khoản admin",
    roles: roles,
  });
};

module.exports.accountAdminCreatePost = async (req, res) => {
  const emailExist = await Account.findOne({
    email: req.body.email,
    deleted: false,
  });
  if (emailExist) {
    req.flashFormError("email", "Email này đã tồn tại trên hệ thống!");
    return res.redirect(req.get("Referer"));
  } else {
    const record = new Account(req.body);
    record.password = await passwordHelper.hashPassword(record.password);
    await record.save();

    req.flash("success", "Tạo tài khoản thành công");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminEdit = async (req, res) => {
  try {
    const id = req.params.id;
    const accountDetail = await Account.findOne({
      _id: id,
      deleted: false,
    });

    const roles = await Role.find({
      deleted: false,
    }).select("_id  name");

    res.render("admin/pages/setting-account-admin-edit.pug", {
      title: "Chỉnh sửa tài khoản",
      roles: roles,
      accountDetail: accountDetail,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminEditPatch = async (req, res) => {
  try {
    const emailExist = await Account.findOne({
      email: req.body.email,
      _id: { $ne: req.params.id },
      deleted: false,
    });

    if (emailExist) {
      req.flash("error", "Email đã tồn tại");
      return res.redirect(req.get("Referer"));
    }

    if (req.body.password) {
      req.body.password = await passwordHelper.hashPassword(req.body.password);
    } else {
      delete req.body.password;
    }

    await Account.updateOne({ _id: req.params.id }, req.body);

    req.flash("success", "Cập nhật tài khoản thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tại hoặc đã có lỗi xảy ra");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminDelete = async (req, res) => {
  try {
    const id = req.params.id;

    await Account.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );
    req.flash("success", "Xóa tài khoản thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.accountAdminTrash = async (req, res) => {
  const find = {
    deleted: true,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [
      { fullName: regexKeyword },
      { email: regexKeyword },
      { phone: regexKeyword },
    ];
  }

  //Phân trang
  const countAccount = await Account.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countAccount,
  );
  //hết Phân trang
  const accountList = await Account.find(find)
    .sort({ deletedAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of accountList) {
    const role = await Role.findOne({
      _id: item.role_id,
      deleted: false,
    });
    item.role_name = role?.name || "Không có quyền";
    item.deletedAtFormat = moment(item.deletedAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render("admin/pages/setting-account-admin-trash.pug", {
    title: "Thùng rác tài khoản",
    accountList: accountList,
    pagination: objectPagination,
  });
};

module.exports.accountAdminRestore = async (req, res) => {
  try {
    const id = req.params.id;
    await Account.updateOne(
      { _id: id },
      {
        deleted: false,
      },
    );
    req.flash("success", "Khôi phục tài khoản thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.accountAdmindeleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Account.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn tai khoản thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.accountAdminChangeMultiTrash = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "restore-all":
        await Account.updateMany(
          { _id: { $in: ids } },
          {
            deleted: false,
          },
        );
        req.flash("success", `Đã khôi phục ${ids.length} tài khoản!`);
        break;

      case "delete-all":
        await Account.deleteMany({
          _id: { $in: ids },
        });
        req.flash("success", `Đã xóa ${ids.length} vĩnh viễn tài khoản`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
    res.redirect(req.get("Referer"));
  }
};

module.exports.roleList = async (req, res) => {
  const find = {
    deleted: false,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [{ name: regexKeyword }];
  }

  //Phân trang
  const countRole = await Role.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countRole,
  );
  //hết Phân trang
  const roleList = await Role.find(find)
    .sort({ createdAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of roleList) {
    if (item.createdBy) {
      const infoAccountCreated = await Account.findOne({
        _id: item.createdBy,
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }
    if (item.updatedBy) {
      const infoAccountUpdated = await Account.findOne({
        _id: item.updatedBy,
      });
      item.updatedByFullName = infoAccountUpdated.fullName;
    }
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/setting-role-list.pug", {
    title: "Danh sách nhóm quyền",
    roleList: roleList,
    pagination: objectPagination,
  });
};

module.exports.roleChangeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "delete-all":
        await Role.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash(
          "success",
          `Đã chuyển ${ids.length} nhóm quyền vào thùng rác!`,
        );
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/article/list`);
    res.redirect(req.get("Referer"));
  }
};

module.exports.roleCreate = (req, res) => {
  res.render("admin/pages/setting-role-create.pug", {
    title: "Tạo nhóm quyền",
    permissionList: permissonConfig.permissionList,
  });
};

module.exports.roleCreatePost = async (req, res) => {
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;

  const newRecord = new Role(req.body);
  await newRecord.save();

  req.flash("success", "Tạo nhóm quyền thành công");
  res.redirect(`/${variableCongfig.pathAdmin}/setting/role/list`);
};

module.exports.roleEdit = async (req, res) => {
  try {
    const id = req.params.id;

    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false,
    });

    res.render("admin/pages/setting-role-edit.pug", {
      title: "Chỉnh sửa nhóm quyền",
      permissionList: permissonConfig.permissionList,
      roleDetail: roleDetail,
    });
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/role/list`);
  }
};

module.exports.roleEditPatch = async (req, res) => {
  try {
    const id = req.params.id;
    req.body.updatedBy = req.account.id;
    await Role.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    req.flash("success", "Chỉnh sửa nhóm quyền thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/role/list`);
  }
};

module.exports.roleDelete = async (req, res) => {
  try {
    const id = req.params.id;

    await Role.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );
    req.flash("success", "Xóa nhóm quyền thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/account-admin/list`);
  }
};

module.exports.roleTrash = async (req, res) => {
  const find = {
    deleted: true,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [{ name: regexKeyword }];
  }

  //Phân trang
  const countRole = await Role.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countRole,
  );
  //hết Phân trang
  const roleList = await Role.find(find)
    .sort({ deletedAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of roleList) {
    if (item.createdBy) {
      const infoAccountCreated = await Account.findOne({
        _id: item.createdBy,
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }
    if (item.deletedBy) {
      const infoAccountDeleted = await Account.findOne({
        _id: item.deletedBy,
      });
      item.deletedByFullName = infoAccountDeleted.fullName;
    }
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.deletedAtFormat = moment(item.deletedAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render("admin/pages/setting-role-trash.pug", {
    title: "Thùng rác nhóm quyền",
    roleList: roleList,
    pagination: objectPagination,
  });
};

module.exports.roleRestore = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne(
      { _id: id },
      {
        deleted: false,
      },
    );
    req.flash("success", "Khôi phục nhóm quyền thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/role/trash`);
  }
};

module.exports.roleDeleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn nhóm quyền thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tại");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/role/trash`);
  }
};

module.exports.roleChangeMultiTrash = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "restore-all":
        await Role.updateMany(
          { _id: { $in: ids } },
          {
            deleted: false,
          },
        );
        req.flash("success", `Đã khôi phục ${ids.length} nhóm quyền!`);
        break;

      case "delete-all":
        await Role.deleteMany({
          _id: { $in: ids },
        });
        req.flash("success", `Đã xóa ${ids.length} vĩnh viễn nhóm quyền`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tại hoặc đã xảy ra lỗi");
    res.redirect(`/${variableCongfig.pathAdmin}/setting/role/trash`);
  }
};
