const router = require("express").Router();
const multer = require("multer");

const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const articleController = require("../../controllers/admin/article.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const validate = require("../../validates/admin/article.validate");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", authMiddleware.checkPermission("article_view"), articleController.list);

router.patch("/change-multi", authMiddleware.checkPermission("article_edit"), articleController.changeMulti);

router.get("/create", authMiddleware.checkPermission("article_create"), articleController.create);

router.post(
  "/create",
  authMiddleware.checkPermission("article_create"),
  upload.single("thumbnail"),
  validate.createPost,
  articleController.createPost,
);

router.delete("/delete/:id", authMiddleware.checkPermission("article_delete"), articleController.delete);

router.get("/edit/:id", authMiddleware.checkPermission("article_edit"), articleController.edit);

router.patch(
  "/edit/:id",
  authMiddleware.checkPermission("article_edit"),
  upload.single("thumbnail"),
  validate.editPost,
  articleController.editPatch,
);

router.get("/trash", authMiddleware.checkPermission("article_trash"), articleController.trash);

router.patch("/restore/:id", authMiddleware.checkPermission("article_restore"), articleController.restore);

router.delete("/delete-destroy/:id", authMiddleware.checkPermission("article_destroy"), articleController.deleteDestroy);

router.patch("/change-multi-trash", authMiddleware.checkPermission("article_trash"), articleController.changeMultiTrash);

module.exports = router;
