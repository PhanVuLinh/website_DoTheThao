const moment = require("moment");
const Contact = require("../../models/Contact.model");
const Account = require("../../models/account.model");
const variableCongfig = require("../../config/variable");
module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };
  const contactList = await Contact.find(find).sort({ createdAt: "desc" });

  for (const item of contactList) {
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render(`admin/pages/contact-list.pug`, {
    title: "Danh sách liên hệ",
    contactList: contactList,
  });
};

module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Contact.updateOne(
      { _id: id },
      { deleted: true, deletedBy: req.account.id, deletedAt: Date.now() },
    );
    req.flash("success", "Xóa email thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tại");
    res.redirect(`/${variableCongfig.pathAdmin}/contact/list`);
  }
};

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true,
  };
  const contactList = await Contact.find(find).sort({
    deletedAt: "desc",
  });

  for (const item of contactList) {
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
  res.render("admin/pages/contact-trash.pug", {
    title: "Thùng rác liên hệ",
    contactList: contactList,
  });
};

module.exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    await Contact.updateOne(
      { _id: id },
      {
        deleted: false,
      },
    );
    req.flash("success", "Khôi phục liên hệ thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};

module.exports.deleteDestroy = async (req, res) => {
  try {
    const id = req.params.id;
    await Contact.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn liên hệ thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/trash`);
  }
};
