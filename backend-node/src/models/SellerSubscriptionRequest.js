const mongoose = require("mongoose");

const sellerSubscriptionRequestSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerName: { type: String, required: true, trim: true },
    planName: { type: String, required: true, trim: true },
    productLimit: { type: Number, required: true },
    brandLimit: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Rejected"],
      default: "Pending",
    },
    paymentGateway: {
      type: String,
      enum: ["manual", "stripe"],
      default: "stripe",
    },
    currency: {
      type: String,
      default: "inr",
      trim: true,
      lowercase: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    stripeCustomerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SellerSubscriptionRequest", sellerSubscriptionRequestSchema); 