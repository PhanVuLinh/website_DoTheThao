const router = require("express").Router();
const multer = require("multer");

const productController = require("../../controllers/admin/product.controller");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const upload = multer({ storage: cloudinaryHelper.storage });

router.get("/list", productController.list);

router.get("/create", productController.create);

router.post(
  "/create",
  upload.single("thumbnail"),
  productController.createPost,
);

router.get("/trash", productController.trash);


module.exports = router;
