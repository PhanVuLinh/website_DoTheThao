const router = require("express").Router();
const compareController = require("../../controllers/client/compare.controller");

router.get("/", compareController.index);
router.get("/api/products", compareController.getProductsData);

module.exports = router;
