const router = require("express").Router();

const authMiddleware = require("../../middlewares/admin/auth.middleware");

const authRoutes = require("./auth.route");
const dashboardRoutes = require("../admin/dashboard.route");
const categoryRoutes = require("../admin/category.route");
const productRoutes = require("../admin/product.route");
const orderRoutes = require("../admin/order.route");
const userRoutes = require("../admin/user.route");
const settingRoutes = require("../admin/setting.route");
const profileRoutes = require("../admin/profile.route");

router.use("/auth", authRoutes);

router.use("/dashboard", authMiddleware.requireAuth, dashboardRoutes);

router.use("/category", authMiddleware.requireAuth, categoryRoutes);

router.use("/product", authMiddleware.requireAuth, productRoutes);

router.use("/order", authMiddleware.requireAuth, orderRoutes);

router.use("/user", authMiddleware.requireAuth, userRoutes);

router.use("/setting", authMiddleware.requireAuth, settingRoutes);

router.use("/profile", authMiddleware.requireAuth, profileRoutes);

module.exports = router;
