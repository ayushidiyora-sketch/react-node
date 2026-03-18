const express = require("express");

const { login, adminLogin, sellerLogin, changePassword, logout, getProfile, updateProfile } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/seller/login", sellerLogin);
router.post("/logout", authenticate, logout);
router.get("/profile", authenticate, getProfile);
router.patch("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);

module.exports = router;
