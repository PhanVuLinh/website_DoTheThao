const router = require("express").Router();

const couponController = require("../../controllers/admin/coupon.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const validate = require("../../validates/admin/coupon.validate");

router.get("/list", authMiddleware.checkPermission("coupon_view"), couponController.list);

router.patch("/change-multi", authMiddleware.checkPermission("coupon_edit"), couponController.changeMulti);

router.get("/create", authMiddleware.checkPermission("coupon_create"), couponController.create);

router.post("/create", authMiddleware.checkPermission("coupon_create"), validate.createPost, couponController.createPost);

router.get("/edit/:id", authMiddleware.checkPermission("coupon_edit"), couponController.edit);

router.patch("/edit/:id", authMiddleware.checkPermission("coupon_edit"), validate.createPost, couponController.editPatch);

router.delete("/delete/:id", authMiddleware.checkPermission("coupon_delete"), couponController.delete);

router.get("/trash", authMiddleware.checkPermission("coupon_trash"), couponController.trash);

router.patch("/restore/:id", authMiddleware.checkPermission("coupon_restore"), couponController.restore);

router.delete("/delete-destroy/:id", authMiddleware.checkPermission("coupon_destroy"), couponController.deleteDestroy);

router.patch("/change-multi-trash", authMiddleware.checkPermission("coupon_trash"), couponController.changeMultiTrash);

module.exports = router;
