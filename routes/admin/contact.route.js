const router = require("express").Router();

const contactController = require("../../controllers/admin/contact.controller");

router.get("/list", contactController.list);

router.delete("/delete/:id", contactController.delete);

module.exports = router;
