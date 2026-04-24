const router = require("express").Router();

const userController = require("../../controllers/client/user.controller");

const validate = require("../../validates/client/user.validate");

router.get("/login", userController.login);

router.post("/login", validate.loginPost, userController.loginPost);

router.get("/register", userController.register);

router.post("/register", validate.registerPost, userController.registerPost);

router.get("/logout", userController.logout);

module.exports = router;
