const mongoose = require("mongoose");

const countryTaxRateSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false },
);

const checkoutConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      uppercase: true,
      trim: true,
    },
    shipping: {
      flatRate: {
        type: Number,
        required: true,
        default: 9.99,
        min: 0,
      },
      freeShippingThreshold: {
        type: Number,
        required: true,
        default: 120,
        min: 0,
      },
    },
    tax: {
      defaultRate: {
        type: Number,
        required: true,
        default: 8,
        min: 0,
        max: 100,
      },
      countryRates: {
        type: [countryTaxRateSchema],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CheckoutConfig", checkoutConfigSchema);
