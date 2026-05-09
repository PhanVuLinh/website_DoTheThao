const moment = require("moment");
const Contact = require("../../models/Contact.model");
const Account = require("../../models/account.model");

const variableCongfig = require("../../config/variable");
const paginationHelper = require("../../helpers/pagination.helper");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };
  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [{ email: regexKeyword }];
  }
  //lọc theo ngày tạo
  const dateFilter = {};
  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    dateFilter.$gte = startDate;
  }
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    dateFilter.$lte = endDate;
  }
  if (Object.keys(dateFilter).length > 0) {
    find.createdAt = dateFilter;
  }

  //Phân trang
  const countContact = await Contact.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countContact,
  );
  //hết Phân trang

  const contactList = await Contact.find(find)
    .sort({ createdAt: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const item of contactList) {
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render(`admin/pages/contact-list.pug`, {
    title: "Danh sách liên hệ",
    contactList: contactList,
    pagination: objectPagination,
  });
};

module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "delete-all":
        await Contact.updateMany(
          { _id: { $in: ids } },
          {
            deleted: true,
            deletedBy: updatedBy,
            deletedAt: new Date(),
          },
        );
        req.flash("success", `Đã chuyển ${ids.length} liên hệ vào thùng rác!`);
        break;

      default:
        break;
    }
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tài");
    res.redirect(`/${variableCongfig.pathAdmin}/contact/list`);
    res.redirect(req.get("Referer"));
  }
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

  //Tìm kiếm
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    const regexKeyword = new RegExp(keyword, "i");
    find.$or = [{ email: regexKeyword }];
  }

  //Phân trang
  const countContact = await Contact.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 5,
    },
    req.query,
    countContact,
  );
  //hết Phân trang
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
    pagination: objectPagination,
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

module.exports.changeMultiTrash = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = req.account.id;

    switch (type) {
      case "restore-all":
        await Contact.updateMany(
          { _id: { $in: ids } },
          {
            deleted: false,
          },
        );
        req.flash("success", `Đã khôi phục ${ids.length} liên hệ!`);
        break;

      case "delete-all":
        await Contact.deleteMany({
          _id: { $in: ids },
        });
        req.flash("success", `Đã xóa ${ids.length} vĩnh viễn liên hệ`);
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
