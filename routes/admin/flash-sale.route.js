const router = require("express").Router();

const flashSaleController = require("../../controllers/admin/flash-sale.controller");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const validate = require("../../validates/admin/flash-sale.validate");

router.get(
  "/list",
  authMiddleware.checkPermission(["flash_sale_view", "product_view"]),
  flashSaleController.list
);

router.patch(
  "/change-multi",
  authMiddleware.checkPermission(["flash_sale_edit", "product_edit"]),
  flashSaleController.changeMulti
);

router.get(
  "/create",
  authMiddleware.checkPermission(["flash_sale_create", "product_create"]),
  flashSaleController.create
);

router.post(
  "/create",
  authMiddleware.checkPermission(["flash_sale_create", "product_create"]),
  validate.createPost,
  flashSaleController.createPost
);

router.get(
  "/edit/:id",
  authMiddleware.checkPermission(["flash_sale_edit", "product_edit"]),
  flashSaleController.edit
);

router.patch(
  "/edit/:id",
  authMiddleware.checkPermission(["flash_sale_edit", "product_edit"]),
  validate.createPost,
  flashSaleController.editPatch
);

router.delete(
  "/delete/:id",
  authMiddleware.checkPermission(["flash_sale_delete", "product_delete"]),
  flashSaleController.delete
);

router.get(
  "/trash",
  authMiddleware.checkPermission(["flash_sale_trash", "product_trash"]),
  flashSaleController.trash
);

router.patch(
  "/restore/:id",
  authMiddleware.checkPermission(["flash_sale_restore", "product_restore"]),
  flashSaleController.restore
);

router.delete(
  "/delete-destroy/:id",
  authMiddleware.checkPermission(["flash_sale_destroy", "product_destroy"]),
  flashSaleController.deleteDestroy
);

router.patch(
  "/change-multi-trash",
  authMiddleware.checkPermission(["flash_sale_trash", "product_trash"]),
  flashSaleController.changeMultiTrash
);

module.exports = router;
