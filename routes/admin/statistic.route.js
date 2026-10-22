const router = require("express").Router();
const statisticController = require("../../controllers/admin/statistic.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");

// [GET] /admin/statistic
router.get(
  "/",
  authMiddleware.checkPermission(["statistic_view", "dashboard_view", "order_view"]),
  statisticController.index,
);

// [GET] /admin/statistic/export
router.get(
  "/export",
  authMiddleware.checkPermission(["statistic_export", "statistic_view", "dashboard_view"]),
  statisticController.exportReport,
);

// [GET] /admin/statistic/print
router.get(
  "/print",
  authMiddleware.checkPermission(["statistic_view", "dashboard_view"]),
  statisticController.printView,
);

module.exports = router;
