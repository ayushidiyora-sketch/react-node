const express = require("express");

const {
  getProducts,
  getNewArrivals,
  getGamerWorldProducts,
  getTopSellingProducts,
  getPopularSalesProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  uploadProductImages,
} = require("../controllers/productController");
const { uploadProductImages: uploadMiddleware } = require("../middleware/upload");

const router = express.Router();

router.get("/new-arrivals", getNewArrivals);
router.get("/gamer-world", getGamerWorldProducts);
router.get("/top-selling", getTopSellingProducts);
router.get("/popular-sales", getPopularSalesProducts);
router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.patch("/:id/status", updateProductStatus);
router.delete("/:id", deleteProduct);
router.post("/upload", uploadMiddleware.array("images", 10), uploadProductImages);

module.exports = router;
