const router = require("express").Router();

const userController = require("../../controllers/admin/user.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const validate = require("../../validates/admin/user.validate");

router.get("/list", authMiddleware.checkPermission("user_view"), userController.list);

router.patch("/change-multi", authMiddleware.checkPermission("user_edit"), userController.changeMulti);

router.get("/create", authMiddleware.checkPermission("user_create"), userController.create);

router.post("/create", authMiddleware.checkPermission("user_create"), validate.createPost, userController.createPost);

router.get("/edit/:id", authMiddleware.checkPermission("user_edit"), userController.edit);

router.patch("/edit/:id", authMiddleware.checkPermission("user_edit"), validate.editPatch, userController.editPatch);

router.delete("/delete/:id", authMiddleware.checkPermission("user_delete"), userController.delete);

router.get("/trash", authMiddleware.checkPermission("user_trash"), userController.trash);

router.patch("/restore/:id", authMiddleware.checkPermission("user_restore"), userController.restore);

router.delete("/delete-destroy/:id", authMiddleware.checkPermission("user_destroy"), userController.deleteDestroy);

router.patch("/change-multi-trash", authMiddleware.checkPermission("user_trash"), userController.changeMultiTrash);

module.exports = router;
