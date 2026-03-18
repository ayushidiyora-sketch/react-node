const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const sellerProductSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    brandName: { type: String, default: "", trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    description: { type: String, default: "", trim: true },
    manufacturerName: { type: String, default: "", trim: true },
    manufacturerBrand: { type: String, default: "", trim: true },
    features: { type: String, default: "", trim: true },
    featureImage: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    specifications: { type: [specificationSchema], default: [] },
    metaTitle: { type: String, default: "", trim: true },
    metaDescription: { type: String, default: "", trim: true },
    metaKeywords: { type: String, default: "", trim: true },
    images: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SellerProduct", sellerProductSchema);
