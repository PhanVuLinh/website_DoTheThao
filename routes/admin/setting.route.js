const router = require("express").Router();

const multer = require("multer");
const upload = multer( { dest: "public/admin/uploads/images/" } );

const settingController = require("../../controllers/admin/setting.controller");

router.get("/list", settingController.list);

router.get("/website-info", settingController.websiteInfo);

router.get("/account-admin/list", settingController.accountAdminList);

router.get("/account-admin/create", settingController.accountAdminCreate);

router.post("/account-admin/create", upload.single("avatar"), settingController.accountAdminCreatePost);

router.get("/role/list", settingController.roleList);

router.get("/role/create", settingController.roleCreate);

module.exports = router;