const router = require("express").Router();

const multer = require("multer");

const cloudinaryHelper = require("../../helpers/cloudinary.helper");

const articleController = require("../../controllers/admin/article.controller");

const validate = require("../../validates/admin/article.validate");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", articleController.list);

router.patch("/change-multi", articleController.changeMulti);

router.get("/create", articleController.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  validate.createPost,
  articleController.createPost,
);

router.delete("/delete/:id", articleController.delete);

router.get("/edit/:id", articleController.edit);

router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  validate.editPost,
  articleController.editPatch,
);

router.get("/trash", articleController.trash);

router.patch("/restore/:id", articleController.restore);

router.delete("/delete-destroy/:id", articleController.deleteDestroy);

router.patch("/change-multi-trash", articleController.changeMultiTrash);

module.exports = router;
