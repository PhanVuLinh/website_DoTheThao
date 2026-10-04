const Contact = require("../../models/contact.model");

module.exports.createPost = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    if (!email) {
      req.flash("error", "Vui lòng nhập địa chỉ email!");
      return res.redirect(req.get("Referer") || "/");
    }

    const existEmail = await Contact.findOne({
      email: email,
    });

    if (existEmail) {
      req.flash("error", "Email của bạn đã đăng ký từ trước!");
      return res.redirect(req.get("Referer") || "/");
    }

    const newContact = new Contact({
      ...req.body,
      email: email,
    });
    await newContact.save();

    req.flash("success", "Cảm ơn bạn đã đăng ký nhận tin tức từ chúng tôi!");
    return res.redirect(req.get("Referer") || "/");
  } catch (error) {
    console.error("Contact Error:", error);
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại sau!");
    return res.redirect(req.get("Referer") || "/");
  }
};
