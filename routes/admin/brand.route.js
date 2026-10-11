const router = require("express").Router();
const multer = require("multer");

const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const brandController = require("../../controllers/admin/brand.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const validate = require("../../validates/admin/brand.validate");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", authMiddleware.checkPermission("brand_view"), brandController.list);

router.get("/create", authMiddleware.checkPermission("brand_create"), brandController.create);

router.post(
  "/create",
  authMiddleware.checkPermission("brand_create"),
  upload.single("logo"),
  validate.createPost,
  brandController.createPost,
);

router.get("/edit/:id", authMiddleware.checkPermission("brand_edit"), brandController.edit);

router.patch(
  "/edit/:id",
  authMiddleware.checkPermission("brand_edit"),
  upload.single("logo"),
  validate.editPost,
  brandController.editPatch,
);

router.patch(
  "/change-status/:status/:id",
  authMiddleware.checkPermission("brand_edit"),
  brandController.changeStatus,
);

router.patch(
  "/change-multi",
  authMiddleware.checkPermission("brand_edit"),
  brandController.changeMulti,
);

router.delete("/delete/:id", authMiddleware.checkPermission("brand_delete"), brandController.delete);

module.exports = router;
