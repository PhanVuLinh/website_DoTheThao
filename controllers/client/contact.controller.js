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
    const referer = req.get("Referer") || "/contact";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!email) {
      req.flash("error", "Vui lòng nhập địa chỉ email!");
      return res.redirect(referer);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Địa chỉ email không hợp lệ (Ví dụ: name@gmail.com)!");
      return res.redirect(referer);
    }

    const isContactForm = Boolean(req.body.content || req.body.fullName);

    if (isContactForm) {
      const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
      if (!fullName || fullName.length < 2) {
        req.flash("error", "Vui lòng nhập họ và tên đầy đủ!");
        return res.redirect(referer);
      }

      const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
      const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, "");
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        req.flash("error", "Số điện thoại liên hệ không hợp lệ (cần 10 chữ số)!");
        return res.redirect(referer);
      }

      const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
      if (!content) {
        req.flash("error", "Vui lòng nhập nội dung tin nhắn hoặc câu hỏi cần tư vấn!");
        return res.redirect(referer);
      }

      req.body.fullName = fullName;
      req.body.phone = cleanPhone;
      req.body.content = content;
    } else {
      // Đăng ký nhận tin Newsletter
      const existEmail = await Contact.findOne({
        email: email,
        content: { $exists: false },
      });

      if (existEmail) {
        req.flash("error", "Email này đã được đăng ký nhận tin từ trước!");
        return res.redirect(referer);
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
      req.flash("success", "Cảm ơn bạn đã đăng ký nhận thông tin ưu đãi từ TitiSport!");
    }
    return res.redirect(referer);
  } catch (error) {
    console.error("Contact Error:", error);
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại sau!");
    return res.redirect(req.get("Referer") || "/contact");
  }
};
