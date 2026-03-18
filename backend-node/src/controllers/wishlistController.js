const Product = require("../models/Product");
const WishlistProduct = require("../models/WishlistProduct");

const mapWishlistItem = (item) => ({
  _id: item._id,
  product: item.product
    ? {
      _id: item.product._id,
      name: item.product.name,
      category: item.product.category?._id
        ? { _id: item.product.category._id, name: item.product.category.name }
        : item.product.category,
      price: item.product.price,
      salePrice: item.product.salePrice,
      featureImage: item.product.featureImage,
      images: item.product.images,
    }
    : null,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const getWishlistProducts = async (_req, res, next) => {
  try {
    const items = await WishlistProduct.find()
      .populate({
        path: "product",
        populate: { path: "category", select: "name" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items: items.map(mapWishlistItem),
    });
  } catch (error) {
    return next(error);
  }
};

const addWishlistProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    const productExists = await Product.exists({ _id: productId });

    if (!productExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid product",
      });
    }

    const existing = await WishlistProduct.findOne({ product: productId });

    if (existing) {
      const populatedExisting = await WishlistProduct.findById(existing._id).populate({
        path: "product",
        populate: { path: "category", select: "name" },
      });

      return res.status(200).json({
        success: true,
        message: "Product already in wishlist",
        item: populatedExisting ? mapWishlistItem(populatedExisting) : null,
      });
    }

    const created = await WishlistProduct.create({ product: productId });
    const populated = await WishlistProduct.findById(created._id).populate({
      path: "product",
      populate: { path: "category", select: "name" },
    });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      item: populated ? mapWishlistItem(populated) : null,
    });
  } catch (error) {
    return next(error);
  }
};

const removeWishlistProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const removed = await WishlistProduct.findByIdAndDelete(id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist item removed",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getWishlistProducts,
  addWishlistProduct,
  removeWishlistProduct,
};
