const router = require("express").Router();

const orderController = require("../../controllers/client/order.controller");

router.post("/create", orderController.createPost);

router.get("/success/:orderId", orderController.orderSuccess);

module.exports = router;