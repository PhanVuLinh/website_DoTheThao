const router = require("express").Router();

const dashboardRoutes = require("../admin/dashboard.route");
const accountRoutes = require("../admin/account.route");

router.use("/", dashboardRoutes);

router.use("/", accountRoutes);

module.exports = router;