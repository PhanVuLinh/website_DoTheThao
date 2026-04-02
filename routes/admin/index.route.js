const router = require("express").Router();

const authRoutes = require("./auth.route");
const dashboardRoutes = require("../admin/dashboard.route");
const categoryRoutes = require("../admin/category.route");
const productRoutes = require("../admin/product.route");
const orderRoutes = require("../admin/order.route");
const userRoutes = require("../admin/user.route");
const settingRoutes = require("../admin/setting.route");
const profileRoutes = require("../admin/profile.route");


router.use("/auth", authRoutes);

router.use("/dashboard", dashboardRoutes);

router.use("/category", categoryRoutes);

router.use("/product", productRoutes);

router.use("/order", orderRoutes);

router.use("/user", userRoutes);

router.use("/setting", settingRoutes);

router.use("/profile", profileRoutes);



module.exports = router;