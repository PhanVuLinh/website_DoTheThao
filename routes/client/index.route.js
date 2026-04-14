const router = require("express").Router();

const homeRoutes = require("../client/home.route");
const productRoutes = require("../client/product.route");
const cartRoutes = require("../client/cart.route");

const settingMiddleware = require("../../middlewares/client/setting.middleware");
const categoryMiddleware = require("../../middlewares/client/category.middleware");

router.use(settingMiddleware.websiteInfo);
router.use(categoryMiddleware.list);

router.use("/", homeRoutes);

router.use("/product", productRoutes);

router.use("/cart", cartRoutes);

module.exports = router;
