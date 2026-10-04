const router = require("express").Router();

const userController = require("../../controllers/client/user.controller");
const validate = require("../../validates/client/user.validate");

router.get("/profile", userController.profile);

router.patch("/profile", userController.profilePatch);

router.get("/order-history", userController.orderHistory);

router.get("/order-history/detail/:orderId", userController.orderHistoryDetail);

router.get("/change-password", userController.changePassword);
router.patch("/password/edit", validate.changePassword, userController.changePasswordPatch);
router.post("/password/edit", validate.changePassword, userController.changePasswordPatch);
router.patch("/change-password", validate.changePassword, userController.changePasswordPatch);
router.post("/change-password", validate.changePassword, userController.changePasswordPatch);

module.exports = router;

