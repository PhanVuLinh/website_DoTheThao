const router = require("express").Router();

const contactController = require("../../controllers/client/contact.controller");
const { contactLimiter } = require("../../middlewares/rateLimit.middleware");

router.get("/", contactController.index);
router.post("/create", contactLimiter, contactController.createPost);

module.exports = router;
