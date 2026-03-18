const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      default: null,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    manufacturerName: {
      type: String,
      default: "",
      trim: true,
    },
    manufacturerBrand: {
      type: String,
      default: "",
      trim: true,
    },
    features: {
      type: String,
      default: "",
      trim: true,
    },
    featureImage: {
      type: String,
      default: "",
    },
    gallery: {
      type: [String],
      default: [],
    },
    specifications: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },
    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },
    metaKeywords: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    submittedByRole: {
      type: String,
      enum: ["admin", "seller"],
      default: "admin",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    sellerName: {
      type: String,
      default: "",
      trim: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },
    bestSelling: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
