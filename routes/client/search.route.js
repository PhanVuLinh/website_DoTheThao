const router = require("express").Router();

const searchController = require("../../controllers/client/search.controller");

router.get("/suggest", searchController.suggest);
router.get("/", searchController.searchList);

module.exports = router;
