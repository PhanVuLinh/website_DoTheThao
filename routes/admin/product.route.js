const router = require("express").Router();
const multer = require("multer");

const productController = require("../../controllers/admin/product.controller");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const upload = multer({ storage: cloudinaryHelper.storage });

const validate = require("../../validates/admin/product.validate");

router.get("/list", productController.list);

router.patch("/change-multi", productController.changeMulti);

router.get("/create", productController.create);

router.post(
  "/create",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  validate.createPost,
  productController.createPost,
);

router.get("/edit/:id", productController.edit);

router.patch(
  "/edit/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  validate.createPost,
  productController.editPatch,
);

router.delete("/delete/:id", productController.delete);

router.get("/trash", productController.trash);

router.patch("/restore/:id", productController.restore);

router.delete("/delete-destroy/:id", productController.deleteDestroy);

router.patch("/change-multi-trash", productController.changeMultiTrash);

module.exports = router;
