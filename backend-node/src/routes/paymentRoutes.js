const express = require("express");

const {
	createPaymentIntent,
	getPaymentConfig,
	createPayPalOrder,
	capturePayPalOrder,
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/config", getPaymentConfig);
router.post("/create-payment-intent", createPaymentIntent);
router.post("/create-paypal-order", createPayPalOrder);
router.post("/capture-paypal-order", capturePayPalOrder);

module.exports = router;