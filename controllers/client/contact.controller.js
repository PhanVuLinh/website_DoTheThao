const Contact = require("../../models/Contact.model");
module.exports.createPost = async (req, res) => {
  const existEmail = await Contact.findOne({
    email: req.body.email,
  });

  if (existEmail) {
    req.flash("error", "Email của bạn đã đăng ký");
    res.redirect(req.get("Referer"));
    return;
  }

  const newContact = new Contact(req.body);
  await newContact.save();
  req.flash("success", "Cảm ơn bạn đã đăng ký nhận tin tức từ chúng tôi");

  res.redirect(req.get("Referer"));
};
