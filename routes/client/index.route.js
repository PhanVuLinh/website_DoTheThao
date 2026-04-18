const router = require("express").Router();

const homeRoutes = require("../client/home.route");
const productRoutes = require("../client/product.route");
const cartRoutes = require("../client/cart.route");
const contactRoutes = require("../client/contact.route");
const categoryRoutes = require("../client/category.route");

const settingMiddleware = require("../../middlewares/client/setting.middleware");
const categoryMiddleware = require("../../middlewares/client/category.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");

router.use(settingMiddleware.websiteInfo);
router.use(categoryMiddleware.list);
router.use(cartMiddleware.cartId);

router.use("/", homeRoutes);

router.use("/product", productRoutes);

router.use("/cart", cartRoutes);

router.use("/contact", contactRoutes);

router.use("/category", categoryRoutes);

module.exports = router;
