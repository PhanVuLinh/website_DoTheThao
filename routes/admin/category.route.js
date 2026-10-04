const router = require("express").Router();
const multer = require("multer");

const categoryController = require("../../controllers/admin/category.controller");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const validate = require("../../validates/admin/category.validate");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", authMiddleware.checkPermission("category_view"), categoryController.list);

router.patch("/change-multi", authMiddleware.checkPermission("category_edit"), categoryController.changeMulti);

router.get("/create", authMiddleware.checkPermission("category_create"), categoryController.create);

router.post(
  "/create",
  authMiddleware.checkPermission("category_create"),
  upload.single("thumbnail"),
  validate.createPost,
  categoryController.createPost,
);

router.get("/edit/:id", authMiddleware.checkPermission("category_edit"), categoryController.edit);

router.patch(
  "/edit/:id",
  authMiddleware.checkPermission("category_edit"),
  upload.single("thumbnail"),
  validate.createPost,
  categoryController.editPatch,
);

router.delete("/delete/:id", authMiddleware.checkPermission("category_delete"), categoryController.delete);

router.get("/trash", authMiddleware.checkPermission("category_trash"), categoryController.trash);

router.patch("/restore/:id", authMiddleware.checkPermission("category_restore"), categoryController.restore);

router.delete("/delete-destroy/:id", authMiddleware.checkPermission("category_destroy"), categoryController.deleteDestroy);

router.patch("/change-multi-trash", authMiddleware.checkPermission("category_trash"), categoryController.changeMultiTrash);

module.exports = router;
