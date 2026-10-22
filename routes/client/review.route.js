const router = require("express").Router();
const multer = require("multer");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const { reviewLimiter } = require("../../middlewares/rateLimit.middleware");

const upload = multer({
  storage: cloudinaryHelper.storage,
  limits: cloudinaryHelper.limits,
  fileFilter: cloudinaryHelper.imageFilter,
});

const reviewController = require("../../controllers/client/review.controller");

router.post("/create", reviewLimiter, upload.array("images", 3), reviewController.createPost);

module.exports = router;
