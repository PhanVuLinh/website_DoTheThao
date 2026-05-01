const router = require("express").Router();

const authController = require("../../controllers/client/auth.controller");

const validate = require("../../validates/client/user.validate");

router.get("/login", authController.login);

router.post("/login", validate.loginPost, authController.loginPost);

router.get("/register", authController.register);

router.post("/register", validate.registerPost, authController.registerPost);

router.get("/logout", authController.logout);

router.get("/forgot-password", authController.forgotPassword);

router.post(
  "/forgot-password",
  validate.forgotPasswordPost,
  authController.forgotPasswordPost,
);

router.get("/otp-password", authController.otpPassword);

router.post(
  "/otp-password",
  validate.otpPasswordPost,
  authController.otpPasswordPost,
);

router.get("/reset-password", authController.resetPassword);

router.post(
  "/reset-password",
  validate.resetPasswordPost,
  authController.resetPasswordPost,
);

module.exports = router;
