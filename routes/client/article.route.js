const router = require("express").Router();

const articleController = require("../../controllers/client/article.controller");

router.get("/", articleController.list);

router.get("/detail/:slug", articleController.detail);

module.exports = router;
