const router = require("express").Router();
const policyController = require("../../controllers/client/policy.controller");

router.get("/:slug", policyController.detail);

module.exports = router;
