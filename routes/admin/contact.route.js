const router = require("express").Router();

const contactController = require("../../controllers/admin/contact.controller");

router.get("/list", contactController.list);

router.patch("/change-multi", contactController.changeMulti);

router.delete("/delete/:id", contactController.delete);

router.get("/trash", contactController.trash);

router.patch("/restore/:id", contactController.restore);

router.delete("/delete-destroy/:id", contactController.deleteDestroy);

router.patch("/change-multi-trash", contactController.changeMultiTrash);

module.exports = router;
