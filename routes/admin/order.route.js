const router = require("express").Router();

const orderController = require("../../controllers/admin/order.controller");

router.get("/list", orderController.list);

router.patch("/change-multi", orderController.changeMulti);

router.get("/edit/:id", orderController.edit);

router.patch("/edit/:id", orderController.editPatch);

router.delete("/delete/:id", orderController.delete);

router.get("/trash", orderController.trash);

router.patch("/restore/:id", orderController.restore);

router.delete("/delete-destroy/:id", orderController.deleteDestroy);

module.exports = router;