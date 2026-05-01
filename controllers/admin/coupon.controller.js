const moment = require("moment");
const Coupon = require("../../models/coupon.model");
const Account = require("../../models/account.model");

const variableCongfig = require("../../config/variable");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };
  const couponList = await Coupon.find(find).sort({ createdAt: "desc" });

  for (const item of couponList) {
    item.expirationDateFormat = moment(item.expirationDate).format(
      "DD/MM/YYYY",
    );
  }
  res.render("admin/pages/coupon-list.pug", {
    title: "Danh sách mã giảm giá",
    couponList: couponList,
  });
};

module.exports.create = (req, res) => {
  res.render("admin/pages/coupon-create.pug", {
    title: "Tạo mới mã giảm giá",
  });
};

module.exports.createPost = async (req, res) => {
  try {
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.maxDiscountAmount = parseInt(req.body.maxDiscountAmount);
    req.body.quantity = parseInt(req.body.quantity);
    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;

    const newRecord = new Coupon(req.body);
    await newRecord.save();

    req.flash("success", "Thêm mã giảm giá thành công!");
    res.redirect(`/${variableCongfig.pathAdmin}/coupon/list`);
  } catch (error) {
    req.flash("error", "Lỗi tạo mã giảm giá (Có thể mã bị trùng)!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const couponDetail = await Coupon.findOne({
      _id: id,
      deleted: false,
    });
    couponDetail.expirationDateInput = moment(
      couponDetail.expirationDate,
    ).format("YYYY-MM-DD");
    res.render("admin/pages/coupon-edit.pug", {
      title: "Chinh sửa mã giảm giá",
      couponDetail: couponDetail,
    });
  } catch (error) {
    req.flash("error", "Không tồn tại mã giảm giá!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    await Coupon.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    req.flash("success", "Cập nhật má giảm giá thành công!");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tại mã giảm giá!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Coupon.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now(),
      },
    );
    req.flash("success", "Xóa má giảm giá thành công!");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tại má giảm giá!");
    res.redirect(req.get("Referer"));
  }
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };
  const couponList = await Coupon.find(find).sort({ deletedAt: "desc" });

  for (const item of couponList) {
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
    item.expirationDateFormat = moment(item.expirationDate).format(
      "DD/MM/YYYY",
    );
  }
  res.render("admin/pages/coupon-trash.pug", {
    title: "Thùng rác má giảm giá",
    couponList: couponList,
  });
};

module.exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    await Coupon.updateOne(
      { _id: id },
      {
        deleted: false,
      },
    );
    req.flash("success", "Khôi phục mã giảm giá thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài mã giảm giá");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.deleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Coupon.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn mã giảm giá thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài mã giảm giá");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};
