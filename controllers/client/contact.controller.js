const Contact = require("../../models/contact.model");

module.exports.index = async (req, res) => {
  res.render("client/pages/contact.pug", {
    title: "Liên hệ & Hỗ trợ khách hàng",
    breadcrumb: {
      title: "Liên Hệ",
      list: [
        {
          title: "Trang chủ",
          link: "/",
        },
        {
          title: "Liên hệ",
          link: "/contact",
        },
      ],
    },
  });
};

module.exports.createPost = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    if (!email) {
      req.flash("error", "Vui lòng nhập địa chỉ email!");
      return res.redirect(req.get("Referer") || "/contact");
    }

    const isContactForm = Boolean(req.body.content || req.body.fullName);

    if (!isContactForm) {
      const existEmail = await Contact.findOne({
        email: email,
        content: { $exists: false },
      });

      if (existEmail) {
        req.flash("error", "Email của bạn đã đăng ký từ trước!");
        return res.redirect(req.get("Referer") || "/");
      }
    }

    const newContact = new Contact({
      ...req.body,
      email: email,
    });
    await newContact.save();

    if (isContactForm) {
      req.flash(
        "success",
        "Cảm ơn bạn đã liên hệ! Đội ngũ tư vấn sẽ phản hồi trong thời gian sớm nhất.",
      );
    } else {
      req.flash("success", "Cảm ơn bạn đã đăng ký nhận tin tức từ chúng tôi!");
    }
    return res.redirect(req.get("Referer") || "/contact");
  } catch (error) {
    console.error("Contact Error:", error);
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại sau!");
    return res.redirect(req.get("Referer") || "/contact");
  }
};
