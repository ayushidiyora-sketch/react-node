const mongoose = require("mongoose");

const sellerBrandSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    brandName: { type: String, required: true, trim: true },
    logo: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    sellerName: { type: String, required: true, trim: true },
    companyName: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    pincode: { type: String, default: "", trim: true },
    gstNumber: { type: String, default: "", trim: true },
    websiteUrl: { type: String, default: "", trim: true },
    contactInfo: {
      companyName: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true, lowercase: true },
      phone: { type: String, default: "", trim: true },
      websiteUrl: { type: String, default: "", trim: true },
      address: { type: String, default: "", trim: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SellerBrand", sellerBrandSchema);