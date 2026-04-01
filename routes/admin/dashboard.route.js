const router = require("express").Router();

const dashboardController = require("../../controllers/admin/dashboard.controller");

router.get("/dashboard", dashboardController.dashboard);

module.exports = router;