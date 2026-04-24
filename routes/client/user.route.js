const router = require("express").Router();

const userController = require("../../controllers/client/user.controller");

const validate = require("../../validates/client/user.validate");

router.get("/login", userController.login);

router.post("/login", validate.loginPost, userController.loginPost);

router.get("/register", userController.register);

router.post("/register", validate.registerPost, userController.registerPost);

router.get("/logout", userController.logout);

router.get("/forgot-password", userController.forgotPassword);

router.post(
  "/forgot-password",
  validate.forgotPasswordPost,
  userController.forgotPasswordPost,
);

router.get("/otp-password", userController.otpPassword);

router.post(
  "/otp-password",
  validate.otpPasswordPost,
  userController.otpPasswordPost,
);

router.get("/reset-password", userController.resetPassword);

router.post(
  "/reset-password",
  validate.resetPasswordPost,
  userController.resetPasswordPost,
);

module.exports = router;
