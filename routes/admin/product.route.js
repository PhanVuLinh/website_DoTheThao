const router = require("express").Router();
const multer = require("multer");

const productController = require("../../controllers/admin/product.controller");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const upload = multer({ storage: cloudinaryHelper.storage });

const validate = require("../../validates/admin/product.validate");

router.get("/list", productController.list);

router.get("/create", productController.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  validate.createPost,
  productController.createPost,
);

router.get("/edit/:id", productController.edit);

router.get("/trash", productController.trash);

router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  validate.createPost,
  productController.editPatch,
);

router.delete("/delete/:id", productController.delete);

module.exports = router;
