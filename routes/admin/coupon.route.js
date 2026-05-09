const router = require("express").Router();

const couponController = require("../../controllers/admin/coupon.controller");

const validate = require("../../validates/admin/coupon.validate");

router.get("/list", couponController.list);

router.patch("/change-multi", couponController.changeMulti);

router.get("/create", couponController.create);

router.post("/create", validate.createPost, couponController.createPost);

router.get("/edit/:id", couponController.edit);

router.patch("/edit/:id", validate.createPost, couponController.editPatch);

router.delete("/delete/:id", couponController.delete);

router.get("/trash", couponController.trash);

router.patch("/restore/:id", couponController.restore);

router.delete("/delete-destroy/:id", couponController.deleteDestroy);

router.patch("/change-multi-trash", couponController.changeMultiTrash);

module.exports = router;
