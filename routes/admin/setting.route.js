const router = require("express").Router();
const multer = require("multer");

const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const validate = require("../../validates/admin/role.validate");
const settingController = require("../../controllers/admin/setting.controller");

const upload = multer({ storage: cloudinaryHelper.storage });

// =====================================
// CẤU HÌNH WEBSITE & TRANG CHỦ
// =====================================
router.get("/list", authMiddleware.checkPermission("setting_view"), settingController.list);

router.get("/website-info", authMiddleware.checkPermission("setting_view"), settingController.websiteInfo);

router.patch(
  "/website-info",
  authMiddleware.checkPermission("setting_edit"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
    { name: "heroImage", maxCount: 1 },
    { name: "promoBannerImage", maxCount: 1 },
    { name: "bankQrCode", maxCount: 1 },
  ]),
  settingController.websiteInfoPatch,
);

// =====================================
// QUẢN LÝ TÀI KHOẢN ADMIN
// =====================================
router.get("/account-admin/list", authMiddleware.checkPermission("account_admin_view"), settingController.accountAdminList);

router.patch(
  "/account-admin/change-multi",
  authMiddleware.checkPermission("account_admin_edit"),
  settingController.accountAdminChangeMulti,
);

router.get("/account-admin/create", authMiddleware.checkPermission("account_admin_create"), settingController.accountAdminCreate);

router.post(
  "/account-admin/create",
  authMiddleware.checkPermission("account_admin_create"),
  upload.single("avatar"),
  settingController.accountAdminCreatePost,
);

router.get("/account-admin/edit/:id", authMiddleware.checkPermission("account_admin_edit"), settingController.accountAdminEdit);

router.patch(
  "/account-admin/edit/:id",
  authMiddleware.checkPermission("account_admin_edit"),
  upload.single("avatar"),
  settingController.accountAdminEditPatch,
);

router.delete(
  "/account-admin/delete/:id",
  authMiddleware.checkPermission("account_admin_delete"),
  settingController.accountAdminDelete,
);

router.get("/account-admin/trash", authMiddleware.checkPermission("account_admin_trash"), settingController.accountAdminTrash);

router.patch(
  "/account-admin/change-multi-trash",
  authMiddleware.checkPermission("account_admin_trash"),
  settingController.accountAdminChangeMultiTrash,
);

router.patch(
  "/account-admin/restore/:id",
  authMiddleware.checkPermission("account_admin_restore"),
  settingController.accountAdminRestore,
);

router.delete(
  "/account-admin/delete-destroy/:id",
  authMiddleware.checkPermission("account_admin_destroy"),
  settingController.accountAdmindeleteDestroy,
);

// =====================================
// QUẢN LÝ NHÓM QUYỀN (ROLE)
// =====================================
router.get("/role/list", authMiddleware.checkPermission("role_view"), settingController.roleList);

router.patch("/role/change-multi", authMiddleware.checkPermission("role_edit"), settingController.roleChangeMulti);

router.get("/role/create", authMiddleware.checkPermission("role_create"), settingController.roleCreate);

router.post(
  "/role/create",
  authMiddleware.checkPermission("role_create"),
  validate.createPost,
  settingController.roleCreatePost,
);

router.get("/role/edit/:id", authMiddleware.checkPermission("role_edit"), settingController.roleEdit);

router.patch(
  "/role/edit/:id",
  authMiddleware.checkPermission("role_edit"),
  validate.createPost,
  settingController.roleEditPatch,
);

router.delete("/role/delete/:id", authMiddleware.checkPermission("role_delete"), settingController.roleDelete);

router.get("/role/trash", authMiddleware.checkPermission("role_trash"), settingController.roleTrash);

router.patch("/role/restore/:id", authMiddleware.checkPermission("role_restore"), settingController.roleRestore);

router.delete("/role/delete-destroy/:id", authMiddleware.checkPermission("role_destroy"), settingController.roleDeleteDestroy);

router.patch(
  "/role/change-multi-trash",
  authMiddleware.checkPermission("role_trash"),
  settingController.roleChangeMultiTrash,
);

module.exports = router;
