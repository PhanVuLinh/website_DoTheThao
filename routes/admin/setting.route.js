const router = require("express").Router();

const multer = require("multer");

const cloudinaryHelper = require("../../helpers/cloudinary.helper");

const validate = require("../../validates/admin/role.validate");

const upload = multer({ storage: cloudinaryHelper.storage });

const settingController = require("../../controllers/admin/setting.controller");

router.get("/list", settingController.list);

router.get("/website-info", settingController.websiteInfo);

router.patch(
  "/website-info",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  settingController.websiteInfoPatch,
);

router.get("/account-admin/list", settingController.accountAdminList);

router.patch(
  "/account-admin/change-multi",
  settingController.accountAdminChangeMulti,
);

router.get("/account-admin/create", settingController.accountAdminCreate);

router.post(
  "/account-admin/create",
  upload.single("avatar"),
  settingController.accountAdminCreatePost,
);

router.get("/account-admin/edit/:id", settingController.accountAdminEdit);

router.patch(
  "/account-admin/edit/:id",
  upload.single("avatar"),
  // validate.createPost,
  settingController.accountAdminEditPatch,
);

router.delete(
  "/account-admin/delete/:id",
  settingController.accountAdminDelete,
);

router.get("/account-admin/trash", settingController.accountAdminTrash);

router.patch(
  "/account-admin/change-multi-trash",
  settingController.accountAdminChangeMultiTrash,
);

router.patch(
  "/account-admin/restore/:id",
  settingController.accountAdminRestore,
);

router.delete(
  "/account-admin/delete-destroy/:id",
  settingController.accountAdmindeleteDestroy,
);

router.get("/role/list", settingController.roleList);

router.patch("/role/change-multi", settingController.roleChangeMulti);

router.get("/role/create", settingController.roleCreate);

router.post(
  "/role/create",
  validate.createPost,
  settingController.roleCreatePost,
);

router.get("/role/edit/:id", settingController.roleEdit);

router.patch(
  "/role/edit/:id",
  validate.createPost,
  settingController.roleEditPatch,
);

router.delete("/role/delete/:id", settingController.roleDelete);

router.get("/role/trash", settingController.roleTrash);

router.patch("/role/restore/:id", settingController.roleRestore);

router.delete("/role/delete-destroy/:id", settingController.roleDeleteDestroy);

router.patch(
  "/role/change-multi-trash",
  settingController.roleChangeMultiTrash,
);

module.exports = router;
