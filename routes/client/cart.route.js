const router = require("express").Router();

const cartController = require("../../controllers/client/cart.controller");

router.get("/", cartController.cart);

router.post("/add/:productId", cartController.addToCart);

router.get("/delete/:productId", cartController.deleteProduct);

router.get("/update/:productId/:quantity", cartController.updateQuantity);

module.exports = router;
