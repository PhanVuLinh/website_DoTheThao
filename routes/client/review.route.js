const router = require("express").Router();
const multer = require("multer");
const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const upload = multer({ storage: cloudinaryHelper.storage });

const reviewController = require("../../controllers/client/review.controller");

router.post("/create", upload.array("images", 3), reviewController.createPost);

module.exports = router;
