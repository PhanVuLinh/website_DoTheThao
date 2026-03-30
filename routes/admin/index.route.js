const router = require("express").Router();

const accountRoutes = require("../admin/account.route");

router.use("/", accountRoutes);

module.exports = router;