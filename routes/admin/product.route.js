const router = require("express").Router();
const multer = require("multer");

const productController = require("../../controllers/admin/product.controller");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const upload = multer({ storage: cloudinaryHelper.storage });

const validate = require("../../validates/admin/product.validate");

router.get("/list", authMiddleware.checkPermission("product_view"), productController.list);

router.patch("/change-multi", authMiddleware.checkPermission("product_edit"), productController.changeMulti);

router.get("/create", authMiddleware.checkPermission("product_create"), productController.create);

router.post(
  "/create",
  authMiddleware.checkPermission("product_create"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  validate.createPost,
  productController.createPost,
);

router.get("/edit/:id", authMiddleware.checkPermission("product_edit"), productController.edit);

router.patch(
  "/edit/:id",
  authMiddleware.checkPermission("product_edit"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  validate.createPost,
  productController.editPatch,
);

router.delete("/delete/:id", authMiddleware.checkPermission("product_delete"), productController.delete);

router.get("/trash", authMiddleware.checkPermission("product_trash"), productController.trash);

router.patch("/restore/:id", authMiddleware.checkPermission("product_restore"), productController.restore);

router.delete("/delete-destroy/:id", authMiddleware.checkPermission("product_destroy"), productController.deleteDestroy);

router.patch("/change-multi-trash", authMiddleware.checkPermission("product_trash"), productController.changeMultiTrash);

module.exports = router;
