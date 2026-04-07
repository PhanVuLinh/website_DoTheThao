const router = require("express").Router();

const multer = require("multer");

const categoryController = require("../../controllers/admin/category.controller");

const cloudinaryHelper = require("../../helpers/cloudinary.helper");

const validate = require("../../validates/admin/category.validate");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", categoryController.list);

router.get("/create", categoryController.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  validate.createPost,
  categoryController.createPost,
);

router.get("/edit/:id", categoryController.edit);

router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  validate.createPost,
  categoryController.editPatch,
);

router.delete("/delete/:id", categoryController.delete);

module.exports = router;
