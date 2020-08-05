var express = require('express');
var router = express.Router();
var authMiddleware = require("../middleware/auth");
var orderController = require("../controller/order");


router.post("/paypal-payment-method",authMiddleware.authenticate,orderController.payPalTransactionComplete);

router.get("/get-my-orders",authMiddleware.authenticate,orderController.getMyOrders);
router.get("/get-all-orders",authMiddleware.authenticate,orderController.getAllOrders);

router.post("/edit-order",authMiddleware.authenticate,orderController.editOrder);
router.delete("/delete-order",authMiddleware.authenticate,orderController.deleteOrder)

module.exports = router;
      