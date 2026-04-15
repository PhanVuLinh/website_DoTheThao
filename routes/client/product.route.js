const router = require("express").Router();

const productController = require("../../controllers/client/product.controller");


router.get('/detail', productController.detail);

module.exports = router;