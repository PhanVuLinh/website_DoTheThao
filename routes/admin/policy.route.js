const router = require("express").Router();
const policyController = require("../../controllers/admin/policy.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");

router.get("/list", authMiddleware.checkPermission("policy_view"), policyController.list);

router.get("/edit/:id", authMiddleware.checkPermission("policy_edit"), policyController.edit);

router.patch("/edit/:id", authMiddleware.checkPermission("policy_edit"), policyController.editPatch);

module.exports = router;
