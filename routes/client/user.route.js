const router = require("express").Router();

const userController = require("../../controllers/client/user.controller");

router.get("/profile", userController.profile);

router.get("/orders", userController.orders);

module.exports = router;