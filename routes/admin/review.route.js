const router = require("express").Router();
const reviewController = require("../../controllers/admin/review.controller");

router.get("/list", reviewController.list);
router.patch("/change-status/:status/:id", reviewController.changeStatus);
router.patch("/toggle-featured/:id", reviewController.toggleFeatured);
router.delete("/delete/:id", reviewController.delete);

module.exports = router;
