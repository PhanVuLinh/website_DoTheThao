const router = require("express").Router();
const orderController = require("../../controllers/admin/order.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");

router.get("/list", authMiddleware.checkPermission("order_view"), orderController.list);

router.patch("/change-multi", authMiddleware.checkPermission("order_edit"), orderController.changeMulti);

router.get("/edit/:id", authMiddleware.checkPermission("order_view"), orderController.edit);
router.get("/detail/:id", authMiddleware.checkPermission("order_view"), orderController.edit);

router.patch("/edit/:id", authMiddleware.checkPermission("order_edit"), orderController.editPatch);

router.delete("/delete/:id", authMiddleware.checkPermission("order_delete"), orderController.delete);

router.get("/trash", authMiddleware.checkPermission("order_trash"), orderController.trash);

router.patch("/restore/:id", authMiddleware.checkPermission("order_restore"), orderController.restore);

router.delete("/delete-destroy/:id", authMiddleware.checkPermission("order_destroy"), orderController.deleteDestroy);

router.patch("/change-multi-trash", authMiddleware.checkPermission("order_trash"), orderController.changeMultiTrash);

module.exports = router;