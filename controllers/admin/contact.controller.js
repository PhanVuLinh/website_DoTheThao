const moment = require("moment");
const Contact = require("../../models/Contact.model");
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
    await Contact.updateOne({ _id: id }, { deleted: true });
    req.flash("success", "Xóa email thành công");
    res.redirect(req.get("Referer"));
  } catch (error) {
    req.flash("error", "Không tồn tại");
    res.redirect(`/${variableCongfig.pathAdmin}/contact/list`);
  }
};
