const router = require("express").Router();

const multer = require("multer");

const cloudinaryHelper = require("../../helpers/cloudinary.helper");

const articleController = require("../../controllers/admin/article.controller");

const validate = require("../../validates/admin/article.validate");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", articleController.list);

router.get("/create", articleController.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  validate.createPost,
  articleController.createPost,
);

router.delete("/delete/:id", articleController.delete);

module.exports = router;
