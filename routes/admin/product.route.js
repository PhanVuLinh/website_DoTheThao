const router = require("express").Router();

const productController = require("../../controllers/admin/product.controller");

router.get("/list", productController.list);

router.get("/create", productController.create);

router.get("/trash", productController.trash);

module.exports = router;