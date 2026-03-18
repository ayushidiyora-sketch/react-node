const mongoose = require("mongoose");

const sellerCompanyInfoSchema = new mongoose.Schema(
  {
    brandName: { type: String, default: "", trim: true },
    companyName: { type: String, default: "", trim: true },
    phoneNumber: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    address: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    pincode: { type: String, default: "", trim: true },
    gstNumber: { type: String, default: "", trim: true },
    websiteUrl: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const sellerPlanSchema = new mongoose.Schema(
  {
    planName: { type: String, default: "Free" },
    productLimit: { type: Number, default: 1 },
    brandLimit: { type: Number, default: 1 },
    durationDays: { type: Number, default: 30 },
    price: { type: Number, default: 0 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    status: { type: String, enum: ["active", "expired"], default: "active" },
    paymentStatus: { type: String, enum: ["free", "pending", "paid", "rejected"], default: "free" },
  },
  { _id: false },
);

const sellerProfileSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    profileImage: { type: String, default: "", trim: true },
    sellerName: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phoneNumber: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    companyName: { type: String, default: "", trim: true },
    brandName: { type: String, default: "", trim: true },
    gstNumber: { type: String, default: "", trim: true },
    websiteUrl: { type: String, default: "", trim: true },
    companyInfo: { type: sellerCompanyInfoSchema, default: () => ({}) },
    currentPlan: { type: sellerPlanSchema, default: () => ({}) },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SellerProfile", sellerProfileSchema);