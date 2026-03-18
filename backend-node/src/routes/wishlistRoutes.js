const express = require("express");

const {
  getWishlistProducts,
  addWishlistProduct,
  removeWishlistProduct,
} = require("../controllers/wishlistController");

const router = express.Router();

router.get("/products", getWishlistProducts);
router.post("/products", addWishlistProduct);
router.delete("/products/:id", removeWishlistProduct);

module.exports = router;
