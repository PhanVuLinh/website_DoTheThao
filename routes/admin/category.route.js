const router = require("express").Router();

const multer = require("multer");
const upload = multer( { dest: "public/admin/uploads/images/" } );

const categoryController = require("../../controllers/admin/category.controller");

router.get("/list", categoryController.list);

router.get("/create", categoryController.create);

router.post("/create", upload.single("thumbnail"), categoryController.createPost);

module.exports = router;