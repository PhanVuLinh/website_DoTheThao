const router = require("express").Router();

const contactController = require("../../controllers/client/contact.controller");

router.get("/", contactController.index);
router.post("/create", contactController.createPost);

module.exports = router;
