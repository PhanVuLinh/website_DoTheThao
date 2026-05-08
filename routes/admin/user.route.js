const router = require("express").Router();

const userController = require("../../controllers/admin/user.controller");

const validate = require("../../validates/admin/user.validate");

router.get("/list", userController.list);

router.patch("/change-multi", userController.changeMulti);

router.get("/create", userController.create);

router.post("/create", validate.createPost, userController.createPost);

router.get("/edit/:id", userController.edit);

router.patch("/edit/:id", validate.editPatch, userController.editPatch);

router.delete("/delete/:id", userController.delete);

router.get("/trash", userController.trash);

router.patch("/restore/:id", userController.restore);

router.delete("/delete-destroy/:id", userController.deleteDestroy);

module.exports = router;
