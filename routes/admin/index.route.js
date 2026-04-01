const router = require("express").Router();

const dashboardRoutes = require("../admin/dashboard.route");
const categoryRoutes = require("../admin/category.route");
const productRoutes = require("../admin/product.route");
const orderRoutes = require("../admin/order.route");
const accountRoutes = require("../admin/account.route");

router.use("/dashboard", dashboardRoutes);

router.use("/category", categoryRoutes);

router.use("/product", productRoutes);

router.use("/order", orderRoutes);

router.use("/account", accountRoutes);

module.exports = router;