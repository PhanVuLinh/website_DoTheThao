module.exports.alert = (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.warning = req.flash("warning");

  // Tự động giải nén dữ liệu cũ và lỗi theo từng trường cho tất cả Pug templates
  res.locals.oldData = req.flash("oldData")[0] || {};
  res.locals.formErrors = req.flash("formErrors")[0] || {};

  // Helper cho controller và validate middleware: vừa lưu oldData, vừa lưu formErrors
  req.flashFormError = (fieldOrErrors, errorMessage) => {
    let errors = {};
    if (typeof fieldOrErrors === "string") {
      errors[fieldOrErrors] = errorMessage;
    } else if (typeof fieldOrErrors === "object" && fieldOrErrors !== null) {
      errors = fieldOrErrors;
    }
    req.flash("oldData", req.body);
    req.flash("formErrors", errors);
    if (errorMessage) {
      req.flash("error", errorMessage);
    }
  };

  next();
};
