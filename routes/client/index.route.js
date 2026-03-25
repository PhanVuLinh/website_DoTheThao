const router = require("express").Router();

const homeRoutes = require("../client/home.route");
const productRoutes = require("../client/product.route");

router.use("/", homeRoutes);

router.use("/products", productRoutes);

module.exports = router;