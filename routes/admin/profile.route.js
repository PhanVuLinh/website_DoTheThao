const router = require("express").Router();
const multer = require("multer");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const upload = multer({ storage: cloudinaryHelper.storage });

const profileController = require("../../controllers/admin/profile.controller");

const validate = require("../../validates/admin/profile.validate");

router.get("/edit", profileController.edit);

router.patch(
  "/edit",
  upload.single("avatar"),
  validate.editPatch,
  profileController.editPatch,
);

router.get("/change-password", profileController.changePassword);

router.patch(
  "/change-password",
  validate.changePasswordPatch,
  profileController.changePasswordPatch,
);

module.exports = router;
