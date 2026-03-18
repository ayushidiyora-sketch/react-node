const express = require("express");

const {
  getCheckoutConfig,
  updateCheckoutConfig,
  calculateCharges,
} = require("../controllers/checkoutController");
const { adminAuthMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/charges", calculateCharges);
router.get("/config", ...adminAuthMiddleware, getCheckoutConfig);
router.put("/config", ...adminAuthMiddleware, updateCheckoutConfig);

module.exports = router;
