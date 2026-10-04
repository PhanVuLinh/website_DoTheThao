const router = require("express").Router();

const contactController = require("../../controllers/admin/contact.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");

router.get("/list", authMiddleware.checkPermission("contact_view"), contactController.list);

router.patch("/change-multi", authMiddleware.checkPermission("contact_delete"), contactController.changeMulti);

router.delete("/delete/:id", authMiddleware.checkPermission("contact_delete"), contactController.delete);

router.get("/trash", authMiddleware.checkPermission("contact_trash"), contactController.trash);

router.patch("/restore/:id", authMiddleware.checkPermission("contact_restore"), contactController.restore);

router.delete("/delete-destroy/:id", authMiddleware.checkPermission("contact_destroy"), contactController.deleteDestroy);

router.patch("/change-multi-trash", authMiddleware.checkPermission("contact_trash"), contactController.changeMultiTrash);

module.exports = router;
