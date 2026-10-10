const moment = require("moment");
const FlashSale = require("../../models/flash-sale.model");
const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Account = require("../../models/account.model");
const variableConfig = require("../../config/variable");
const paginationHelper = require("../../helpers/pagination.helper");

// Helper parse items từ form POST/PATCH
const parseFlashSaleItems = async (reqBody, existingItems = []) => {
  const items = [];
  const existingMap = new Map();
  if (Array.isArray(existingItems)) {
    existingItems.forEach((it) => {
      if (it && it.product_id) {
        existingMap.set(it.product_id.toString(), it.sold || 0);
      }
    });
  }

  // Trường hợp 1: req.body.products là mảng các object [{ product_id, discountPercentage, quantity }]
  if (Array.isArray(reqBody.products)) {
    for (const p of reqBody.products) {
      if (!p || !p.product_id) continue;
      const product = await Product.findOne({ _id: p.product_id, deleted: false });
      if (!product) continue;

      const discount = Math.min(100, Math.max(0, parseInt(p.discountPercentage || 0, 10)));
      const quantity = Math.max(1, parseInt(p.quantity || 50, 10));
      const flashSalePrice = Math.round((product.price * (100 - discount)) / 100);
      const sold = existingMap.get(p.product_id.toString()) || 0;

      items.push({
        product_id: product._id,
        discountPercentage: discount,
        flashSalePrice: flashSalePrice,
        quantity: quantity,
        sold: sold,
      });
    }
  }
  // Trường hợp 2: Form gửi dạng parallel arrays: product_ids[], discounts[], quantities[]
  else if (reqBody.product_id) {
    const pIds = Array.isArray(reqBody.product_id) ? reqBody.product_id : [reqBody.product_id];
    const discounts = Array.isArray(reqBody.discountPercentage)
      ? reqBody.discountPercentage
      : [reqBody.discountPercentage];
    const quantities = Array.isArray(reqBody.quantity) ? reqBody.quantity : [reqBody.quantity];

    for (let i = 0; i < pIds.length; i++) {
      const pid = pIds[i];
      if (!pid) continue;
      const product = await Product.findOne({ _id: pid, deleted: false });
      if (!product) continue;

      const discount = Math.min(100, Math.max(0, parseInt(discounts[i] || 0, 10)));
      const qty = Math.max(1, parseInt(quantities[i] || 50, 10));
      const flashSalePrice = Math.round((product.price * (100 - discount)) / 100);
      const sold = existingMap.get(pid.toString()) || 0;

      items.push({
        product_id: product._id,
        discountPercentage: discount,
        flashSalePrice: flashSalePrice,
        quantity: qty,
        sold: sold,
      });
    }
  }

  return items;
};

// [GET] /admin/flash-sale/list
module.exports.list = async (req, res) => {
  try {
    const find = { deleted: false };

    // Lọc theo trạng thái active/inactive
    if (req.query.status) {
      find.status = req.query.status;
    }

    // Tìm kiếm từ khóa
    if (req.query.keyword) {
      const keyword = req.query.keyword.trim();
      const regexKeyword = new RegExp(keyword, "i");
      find.$or = [{ title: regexKeyword }, { badge: regexKeyword }, { subTitle: regexKeyword }];
    }

    // Phân trang
    const countFlashSale = await FlashSale.countDocuments(find);
    const objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 8,
      },
      req.query,
      countFlashSale
    );

    const flashSaleList = await FlashSale.find(find)
      .sort({ createdAt: "desc" })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    const now = new Date();

    for (const item of flashSaleList) {
      item.startTimeFormat = moment(item.startTime).format("DD/MM/YYYY HH:mm");
      item.endTimeFormat = moment(item.endTime).format("DD/MM/YYYY HH:mm");

      // Trạng thái vận hành dựa trên thời gian
      if (now < item.startTime) {
        item.runtimeStatus = {
          code: "upcoming",
          label: "Sắp diễn ra",
          badgeClass: "badge-upcoming",
        };
      } else if (item.startTime <= now && now <= item.endTime) {
        item.runtimeStatus = {
          code: "running",
          label: "Đang diễn ra",
          badgeClass: "badge-running",
        };
      } else {
        item.runtimeStatus = {
          code: "ended",
          label: "Đã kết thúc",
          badgeClass: "badge-ended",
        };
      }

      // Thống kê nhanh
      item.totalProducts = Array.isArray(item.items) ? item.items.length : 0;
      item.totalAllocated = Array.isArray(item.items)
        ? item.items.reduce((acc, it) => acc + (it.quantity || 0), 0)
        : 0;
      item.totalSold = Array.isArray(item.items)
        ? item.items.reduce((acc, it) => acc + (it.sold || 0), 0)
        : 0;
      item.soldPercentage =
        item.totalAllocated > 0 ? Math.round((item.totalSold / item.totalAllocated) * 100) : 0;
    }

    res.render("admin/pages/flash-sale-list.pug", {
      title: "Quản lý Chiến dịch Flash Sale",
      flashSaleList: flashSaleList,
      pagination: objectPagination,
    });
  } catch (error) {
    console.error("Lỗi danh sách Flash Sale:", error);
    req.flash("error", "Đã xảy ra lỗi khi tải danh sách chiến dịch!");
    res.redirect(`/${variableConfig.pathAdmin}/dashboard`);
  }
};

// [GET] /admin/flash-sale/create
module.exports.create = async (req, res) => {
  try {
    const products = await Product.find({
      deleted: false,
      status: "active",
    })
      .select("_id title price thumbnail discountPercentage brand category_id")
      .sort({ createdAt: "desc" });

    const categories = await Category.find({
      deleted: false,
      status: "active",
    }).select("_id title");

    // Mặc định thời gian bắt đầu là hiện tại, kết thúc là 24h sau
    const defaultStart = moment().format("YYYY-MM-DDTHH:mm");
    const defaultEnd = moment().add(1, "days").format("YYYY-MM-DDTHH:mm");

    res.render("admin/pages/flash-sale-create.pug", {
      title: "Tạo chiến dịch Flash Sale",
      products: products,
      categories: categories,
      defaultStart: defaultStart,
      defaultEnd: defaultEnd,
      oldData: {},
    });
  } catch (error) {
    console.error("Lỗi mở trang tạo Flash Sale:", error);
    req.flash("error", "Không thể mở trang tạo chiến dịch!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/list`);
  }
};

// [POST] /admin/flash-sale/create
module.exports.createPost = async (req, res) => {
  try {
    const items = await parseFlashSaleItems(req.body);

    if (items.length === 0) {
      req.flash("error", "Vui lòng chọn ít nhất 1 sản phẩm hợp lệ cho chiến dịch!");
      return res.redirect(req.get("Referer"));
    }

    const newCampaign = new FlashSale({
      title: req.body.title.trim(),
      badge: (req.body.badge || "GIỜ VÀNG GIÁ SỐC").trim(),
      subTitle: (req.body.subTitle || "ƯU ĐÃI CÓ HẠN").trim(),
      description: (req.body.description || "").trim(),
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
      status: req.body.status === "inactive" ? "inactive" : "active",
      items: items,
      createdBy: req.account ? req.account.id : "",
    });

    await newCampaign.save();

    req.flash("success", "Tạo chiến dịch Flash Sale thành công!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/list`);
  } catch (error) {
    console.error("Lỗi tạo chiến dịch Flash Sale:", error);
    req.flash("error", "Tạo chiến dịch thất bại, vui lòng thử lại!");
    res.redirect(req.get("Referer"));
  }
};

// [GET] /admin/flash-sale/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const campaign = await FlashSale.findOne({ _id: id, deleted: false }).populate({
      path: "items.product_id",
      select: "_id title price thumbnail discountPercentage brand category_id",
    });

    if (!campaign) {
      req.flash("error", "Chiến dịch Flash Sale không tồn tại!");
      return res.redirect(`/${variableConfig.pathAdmin}/flash-sale/list`);
    }

    const products = await Product.find({
      deleted: false,
      status: "active",
    })
      .select("_id title price thumbnail discountPercentage brand category_id")
      .sort({ createdAt: "desc" });

    const categories = await Category.find({
      deleted: false,
      status: "active",
    }).select("_id title");

    // Format datetime-local cho input
    campaign.startTimeInput = moment(campaign.startTime).format("YYYY-MM-DDTHH:mm");
    campaign.endTimeInput = moment(campaign.endTime).format("YYYY-MM-DDTHH:mm");

    res.render("admin/pages/flash-sale-edit.pug", {
      title: "Chỉnh sửa chiến dịch Flash Sale",
      campaign: campaign,
      products: products,
      categories: categories,
      oldData: {},
    });
  } catch (error) {
    console.error("Lỗi mở trang sửa Flash Sale:", error);
    req.flash("error", "Không thể mở trang chỉnh sửa!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/list`);
  }
};

// [PATCH] /admin/flash-sale/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    const campaign = await FlashSale.findOne({ _id: id, deleted: false });

    if (!campaign) {
      req.flash("error", "Chiến dịch không tồn tại!");
      return res.redirect(`/${variableConfig.pathAdmin}/flash-sale/list`);
    }

    const items = await parseFlashSaleItems(req.body, campaign.items);

    if (items.length === 0) {
      req.flash("error", "Vui lòng chọn ít nhất 1 sản phẩm hợp lệ!");
      return res.redirect(req.get("Referer"));
    }

    campaign.title = req.body.title.trim();
    campaign.badge = (req.body.badge || "GIỜ VÀNG GIÁ SỐC").trim();
    campaign.subTitle = (req.body.subTitle || "ƯU ĐÃI CÓ HẠN").trim();
    campaign.description = (req.body.description || "").trim();
    campaign.startTime = new Date(req.body.startTime);
    campaign.endTime = new Date(req.body.endTime);
    campaign.status = req.body.status === "inactive" ? "inactive" : "active";
    campaign.items = items;
    campaign.updatedBy = req.account ? req.account.id : "";

    await campaign.save();

    req.flash("success", "Cập nhật chiến dịch Flash Sale thành công!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/list`);
  } catch (error) {
    console.error("Lỗi cập nhật Flash Sale:", error);
    req.flash("error", "Cập nhật thất bại, vui lòng thử lại!");
    res.redirect(req.get("Referer"));
  }
};

// [PATCH] /admin/flash-sale/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids ? req.body.ids.split(", ") : [];
    const updatedBy = req.account ? req.account.id : "";

    switch (type) {
      case "active":
      case "inactive":
        await FlashSale.updateMany(
          { _id: { $in: ids } },
          { status: type, updatedBy: updatedBy, updatedAt: new Date() }
        );
        req.flash("success", `Đã cập nhật trạng thái ${ids.length} chiến dịch!`);
        break;

      case "delete-all":
        await FlashSale.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedBy: updatedBy, deletedAt: new Date() }
        );
        req.flash("success", `Đã chuyển ${ids.length} chiến dịch vào thùng rác!`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    console.error("Lỗi change-multi Flash Sale:", error);
    req.flash("error", "Thao tác thất bại!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/list`);
  }
};

// [DELETE] /admin/flash-sale/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedBy = req.account ? req.account.id : "";

    await FlashSale.updateOne(
      { _id: id },
      { deleted: true, deletedBy: updatedBy, deletedAt: new Date() }
    );

    req.flash("success", "Đã chuyển chiến dịch vào thùng rác!");
    res.redirect(req.get("Referer"));
  } catch (error) {
    console.error("Lỗi xóa Flash Sale:", error);
    req.flash("error", "Xóa thất bại!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/list`);
  }
};

// [GET] /admin/flash-sale/trash
module.exports.trash = async (req, res) => {
  try {
    const find = { deleted: true };

    if (req.query.keyword) {
      const keyword = req.query.keyword.trim();
      const regexKeyword = new RegExp(keyword, "i");
      find.$or = [{ title: regexKeyword }, { badge: regexKeyword }];
    }

    const countTrash = await FlashSale.countDocuments(find);
    const objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 8,
      },
      req.query,
      countTrash
    );

    const flashSaleList = await FlashSale.find(find)
      .sort({ deletedAt: "desc" })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    for (const item of flashSaleList) {
      item.deletedDateFormat = item.deletedAt
        ? moment(item.deletedAt).format("DD/MM/YYYY HH:mm")
        : "--";
      item.totalProducts = Array.isArray(item.items) ? item.items.length : 0;
      if (item.deletedBy) {
        const user = await Account.findOne({ _id: item.deletedBy }).select("fullName");
        item.deletedByFullName = user ? user.fullName : "";
      }
    }

    res.render("admin/pages/flash-sale-trash.pug", {
      title: "Thùng rác chiến dịch Flash Sale",
      flashSaleList: flashSaleList,
      pagination: objectPagination,
    });
  } catch (error) {
    console.error("Lỗi thùng rác Flash Sale:", error);
    req.flash("error", "Không thể tải thùng rác!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/list`);
  }
};

// [PATCH] /admin/flash-sale/restore/:id
module.exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    await FlashSale.updateOne({ _id: id }, { deleted: false });
    req.flash("success", "Khôi phục chiến dịch Flash Sale thành công!");
    res.redirect(req.get("Referer"));
  } catch (error) {
    console.error("Lỗi khôi phục Flash Sale:", error);
    req.flash("error", "Không thể khôi phục chiến dịch!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/trash`);
  }
};

// [DELETE] /admin/flash-sale/delete-destroy/:id
module.exports.deleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await FlashSale.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn chiến dịch Flash Sale!");
    res.redirect(req.get("Referer"));
  } catch (error) {
    console.error("Lỗi xóa vĩnh viễn Flash Sale:", error);
    req.flash("error", "Không thể xóa vĩnh viễn chiến dịch!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/trash`);
  }
};

// [PATCH] /admin/flash-sale/change-multi-trash
module.exports.changeMultiTrash = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids ? req.body.ids.split(", ") : [];

    switch (type) {
      case "restore-all":
        await FlashSale.updateMany({ _id: { $in: ids } }, { deleted: false });
        req.flash("success", `Đã khôi phục ${ids.length} chiến dịch!`);
        break;

      case "delete-all":
        await FlashSale.deleteMany({ _id: { $in: ids } });
        req.flash("success", `Đã xóa vĩnh viễn ${ids.length} chiến dịch!`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    console.error("Lỗi change-multi-trash Flash Sale:", error);
    req.flash("error", "Thao tác thất bại!");
    res.redirect(`/${variableConfig.pathAdmin}/flash-sale/trash`);
  }
};
