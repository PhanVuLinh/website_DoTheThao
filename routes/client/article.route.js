const router = require("express").Router();

const articleController = require("../../controllers/client/article.controller");

router.get("/", articleController.list);

module.exports = router;
