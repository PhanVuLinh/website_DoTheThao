const router = require("express").Router();

const homeRoutes = require("../client/home.route");
const productRoutes = require("../client/product.route");
const cartRoutes = require("../client/cart.route");

router.use("/", homeRoutes);

router.use("/product", productRoutes);

router.use("/cart", cartRoutes);

module.exports = router;