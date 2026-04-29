const router = require("express").Router();

const orderController = require("../../controllers/client/order.controller");

router.post("/create", orderController.createPost);

router.get("/success/:orderId", orderController.orderSuccess);

router.get("/payment-zalopay/:orderId", orderController.paymentZalopay);

router.get(
  "/payment-zalopay-return/:orderId",
  orderController.paymentZalopayReturn,
);

router.post(
  "/payment-zalopay-callback",
  orderController.paymentZalopayCallback,
);

router.get("/payment-vnpay/:orderId", orderController.paymentVnpay);

router.get("/payment-vnpay-result", orderController.paymentVnpayResult);

module.exports = router;
