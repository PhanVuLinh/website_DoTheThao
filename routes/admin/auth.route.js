const router = require("express").Router();

const authController = require("../../controllers/admin/auth.controller");

const validate = require("../../validates/admin/auth.validate");

router.get("/login", authController.login);

router.post("/login", validate.loginPost, authController.loginPost);

router.get("/logout", authController.logout);

module.exports = router;
