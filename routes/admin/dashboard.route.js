const router = require("express").Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");

router.get(
  "/",
  authMiddleware.checkPermission("dashboard_view"),
  dashboardController.dashboard,
);

module.exports = router;