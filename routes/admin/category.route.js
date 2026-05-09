const router = require("express").Router();

const multer = require("multer");

const categoryController = require("../../controllers/admin/category.controller");

const cloudinaryHelper = require("../../helpers/cloudinary.helper");

const validate = require("../../validates/admin/category.validate");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", categoryController.list);

router.patch("/change-multi", categoryController.changeMulti);

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

router.get("/trash", categoryController.trash);

router.patch("/restore/:id", categoryController.restore);

router.delete("/delete-destroy/:id", categoryController.deleteDestroy);

router.patch("/change-multi-trash", categoryController.changeMultiTrash);



module.exports = router;
