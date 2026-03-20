const express = require("express");

const {
  createSeller,
  getSellerApplications,
  applySeller,
  updateSellerApplicationStatus,
  getSellerDashboard,
  getSellerProfile,
  updateSellerProfile,
  getSellerCompanyInfo,
  updateSellerCompanyInfo,
  getSubscriptionPlans,
  createSubscriptionRequest,
  createSubscriptionCheckoutSession,
  handleSubscriptionWebhook,
  getMySubscriptionRequests,
  getAdminSubscriptionRequests,
  updateAdminSubscriptionRequestStatus,
  deleteAdminSubscriptionRequest,
  getSellerUsers,
  createSellerBrand,
  getMySellerBrands,
  getMySellerBrandById,
  updateMySellerBrand,
  deleteMySellerBrand,
  getPublicSellerBrandLogos,
  getAdminSellerBrands,
  getAdminSellerBrandById,
  createAdminSellerBrand,
  updateAdminSellerBrand,
  updateAdminSellerBrandStatus,
  deleteAdminSellerBrand,
  createSellerProduct,
  getMySellerProducts,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerPlanLimitStatus,
} = require("../controllers/sellerController");
const { authenticate, adminAuthMiddleware, sellerAuthMiddleware } = require("../middleware/auth");
const { uploadSellerKyc } = require("../middleware/sellerKycUpload");

const router = express.Router();

router.post("/register", createSeller);

router.get("/applications", ...adminAuthMiddleware, getSellerApplications);
router.post("/apply", uploadSellerKyc.array("kycFiles", 5), applySeller);
router.patch("/applications/:id/status", ...adminAuthMiddleware, updateSellerApplicationStatus);

router.get("/dashboard", ...sellerAuthMiddleware, getSellerDashboard);

router.get("/profile", ...sellerAuthMiddleware, getSellerProfile);
router.put("/profile", ...sellerAuthMiddleware, updateSellerProfile);

router.get("/company-info", ...sellerAuthMiddleware, getSellerCompanyInfo);
router.put("/company-info", ...sellerAuthMiddleware, updateSellerCompanyInfo);

router.get("/plans", authenticate, getSubscriptionPlans);
router.post("/subscriptions/webhook", handleSubscriptionWebhook);
router.post("/subscriptions/request", ...sellerAuthMiddleware, createSubscriptionRequest);
router.post("/subscriptions/checkout", ...sellerAuthMiddleware, createSubscriptionCheckoutSession);
router.get("/subscriptions/me", ...sellerAuthMiddleware, getMySubscriptionRequests);
router.get("/subscriptions", ...adminAuthMiddleware, getAdminSubscriptionRequests);
router.patch("/subscriptions/:id/status", ...adminAuthMiddleware, updateAdminSubscriptionRequestStatus);
router.delete("/subscriptions/:id", ...adminAuthMiddleware, deleteAdminSubscriptionRequest);

router.get("/users", ...adminAuthMiddleware, getSellerUsers);

router.get("/limits", ...sellerAuthMiddleware, getSellerPlanLimitStatus);

router.post("/brands", ...sellerAuthMiddleware, createSellerBrand);
router.get("/brands/me", ...sellerAuthMiddleware, getMySellerBrands);
router.get("/brands/me/:id", ...sellerAuthMiddleware, getMySellerBrandById);
router.put("/brands/me/:id", ...sellerAuthMiddleware, updateMySellerBrand);
router.delete("/brands/me/:id", ...sellerAuthMiddleware, deleteMySellerBrand);
router.get("/brands/public", getPublicSellerBrandLogos);
router.get("/brands", ...adminAuthMiddleware, getAdminSellerBrands);
router.post("/brands/admin", ...adminAuthMiddleware, createAdminSellerBrand);
router.get("/brands/:id", ...adminAuthMiddleware, getAdminSellerBrandById);
router.put("/brands/:id", ...adminAuthMiddleware, updateAdminSellerBrand);
router.patch("/brands/:id/status", ...adminAuthMiddleware, updateAdminSellerBrandStatus);
router.delete("/brands/:id", ...adminAuthMiddleware, deleteAdminSellerBrand);

router.post("/products", ...sellerAuthMiddleware, createSellerProduct);
router.get("/products/me", ...sellerAuthMiddleware, getMySellerProducts);
router.put("/products/:id", ...sellerAuthMiddleware, updateSellerProduct);
router.delete("/products/:id", ...sellerAuthMiddleware, deleteSellerProduct);

module.exports = router;
