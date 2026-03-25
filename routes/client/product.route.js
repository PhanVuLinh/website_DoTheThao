const router = require("express").Router();

const productController = require("../../controllers/client/product.controller");

router.get("/", productController.list);

module.exports = router;