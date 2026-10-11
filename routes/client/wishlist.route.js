const router = require("express").Router();
const wishlistController = require("../../controllers/client/wishlist.controller");

router.get("/", wishlistController.index);

module.exports = router;
