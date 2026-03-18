const Category = require("../models/Category");
const Product = require("../models/Product");

const mapProduct = (product) => ({
  _id: product._id,
  name: product.name,
  category: product.category?._id ? { _id: product.category._id, name: product.category.name } : product.category,
  price: product.price,
  salePrice: product.salePrice,
  rating: product.rating,
  description: product.description,
  manufacturerName: product.manufacturerName,
  manufacturerBrand: product.manufacturerBrand,
  features: product.features,
  featureImage: product.featureImage,
  gallery: product.gallery,
  specifications: product.specifications,
  metaTitle: product.metaTitle,
  metaDescription: product.metaDescription,
  metaKeywords: product.metaKeywords,
  images: product.images,
  status: product.status,
  submittedByRole: product.submittedByRole,
  submittedBy: product.submittedBy,
  sellerName: product.sellerName,
  salesCount: product.salesCount,
  orderCount: product.orderCount,
  isPopular: product.isPopular,
  bestSelling: product.bestSelling,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const parseLimit = (rawLimit, fallback = 8) => {
  const parsed = Number.parseInt(rawLimit, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, 24);
};

const approvedProductFilter = {
  $or: [{ status: "approved" }, { status: { $exists: false } }],
};

const getNewArrivals = async (req, res, next) => {
  try {
    const limit = parseLimit(req.query.limit, 8);
    const products = await Product.find(approvedProductFilter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      items: products.map(mapProduct),
    });
  } catch (error) {
    return next(error);
  }
};

const getGamerWorldProducts = async (req, res, next) => {
  try {
    const limit = parseLimit(req.query.limit, 8);
    const gamerWorldCategories = await Category.find({
      name: { $regex: /^gamer\s*world$/i },
    }).select("_id");

    const categoryIds = gamerWorldCategories.map((item) => item._id);

    if (!categoryIds.length) {
      return res.status(200).json({
        success: true,
        items: [],
      });
    }

    const products = await Product.find({
      ...approvedProductFilter,
      category: { $in: categoryIds },
    })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      items: products.map(mapProduct),
    });
  } catch (error) {
    return next(error);
  }
};

const getTopSellingProducts = async (req, res, next) => {
  try {
    const limit = parseLimit(req.query.limit, 8);
    const products = await Product.find(approvedProductFilter)
      .populate("category", "name")
      .sort({ salesCount: -1, orderCount: -1, createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      items: products.map(mapProduct),
    });
  } catch (error) {
    return next(error);
  }
};

const getPopularSalesProducts = async (req, res, next) => {
  try {
    const limit = parseLimit(req.query.limit, 8);
    const products = await Product.find({
      $and: [
        approvedProductFilter,
        { $or: [{ isPopular: true }, { bestSelling: true }] },
      ],
    })
      .populate("category", "name")
      .sort({ bestSelling: -1, isPopular: -1, salesCount: -1, createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      items: products.map(mapProduct),
    });
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (typeof status === "string" && ["pending", "approved", "rejected"].includes(status)) {
      if (status === "approved") {
        filter.$or = [{ status: "approved" }, { status: { $exists: false } }];
      } else {
        filter.status = status;
      }
    }

    const products = await Product.find(filter).populate("category", "name").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items: products.map(mapProduct),
    });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      salePrice,
      rating,
      description,
      manufacturerName,
      manufacturerBrand,
      features,
      featureImage,
      gallery,
      specifications,
      metaTitle,
      metaDescription,
      metaKeywords,
      images,
      status,
      submittedByRole,
      submittedBy,
      sellerName,
      salesCount,
      orderCount,
      isPopular,
      bestSelling,
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and price are required",
      });
    }

    const categoryExists = await Category.exists({ _id: category });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      rating: rating ? Number(rating) : 0,
      description: description?.trim() || "",
      manufacturerName: manufacturerName?.trim() || "",
      manufacturerBrand: manufacturerBrand?.trim() || "",
      features: features?.trim() || "",
      featureImage: featureImage?.trim() || "",
      gallery: Array.isArray(gallery) ? gallery : [],
      specifications: Array.isArray(specifications) ? specifications : [],
      metaTitle: metaTitle?.trim() || "",
      metaDescription: metaDescription?.trim() || "",
      metaKeywords: metaKeywords?.trim() || "",
      images: Array.isArray(images) ? images : [],
      status: ["pending", "approved", "rejected"].includes(status) ? status : "approved",
      submittedByRole: submittedByRole === "seller" ? "seller" : "admin",
      submittedBy: submittedBy || null,
      sellerName: sellerName?.trim() || "",
      salesCount: Number.isFinite(Number(salesCount)) ? Math.max(Number(salesCount), 0) : 0,
      orderCount: Number.isFinite(Number(orderCount)) ? Math.max(Number(orderCount), 0) : 0,
      isPopular: Boolean(isPopular),
      bestSelling: Boolean(bestSelling),
    });

    await product.populate("category", "name");

    return res.status(201).json({
      success: true,
      message: "Product created",
      item: mapProduct(product),
    });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      price,
      salePrice,
      rating,
      description,
      manufacturerName,
      manufacturerBrand,
      features,
      featureImage,
      gallery,
      specifications,
      metaTitle,
      metaDescription,
      metaKeywords,
      images,
      salesCount,
      orderCount,
      isPopular,
      bestSelling,
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and price are required",
      });
    }

    const categoryExists = await Category.exists({ _id: category });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        category,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        rating: rating ? Number(rating) : 0,
        description: description?.trim() || "",
        manufacturerName: manufacturerName?.trim() || "",
        manufacturerBrand: manufacturerBrand?.trim() || "",
        features: features?.trim() || "",
        featureImage: featureImage?.trim() || "",
        gallery: Array.isArray(gallery) ? gallery : [],
        specifications: Array.isArray(specifications) ? specifications : [],
        metaTitle: metaTitle?.trim() || "",
        metaDescription: metaDescription?.trim() || "",
        metaKeywords: metaKeywords?.trim() || "",
        images: Array.isArray(images) ? images : [],
        salesCount: Number.isFinite(Number(salesCount)) ? Math.max(Number(salesCount), 0) : 0,
        orderCount: Number.isFinite(Number(orderCount)) ? Math.max(Number(orderCount), 0) : 0,
        isPopular: Boolean(isPopular),
        bestSelling: Boolean(bestSelling),
      },
      { new: true },
    ).populate("category", "name");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated",
      item: mapProduct(updated),
    });
  } catch (error) {
    return next(error);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate("category", "name");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product status updated",
      item: mapProduct(updated),
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    return next(error);
  }
};

const uploadProductImages = async (req, res, next) => {
  try {
    const files = req.files || [];

    const urls = files.map((file) => `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`);

    return res.status(200).json({
      success: true,
      message: "Images uploaded",
      urls,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
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
};
