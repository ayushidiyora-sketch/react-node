const CheckoutConfig = require("../models/CheckoutConfig");

const defaultConfigPayload = {
  key: "default",
  currency: "USD",
  shipping: {
    flatRate: 9.99,
    freeShippingThreshold: 120,
  },
  tax: {
    defaultRate: 8,
    countryRates: [
      { country: "United States", rate: 8 },
      { country: "United Kingdom", rate: 20 },
      { country: "Canada", rate: 5 },
      { country: "India", rate: 18 },
    ],
  },
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeCountry = (value) => String(value || "").trim().toLowerCase();

const sanitizeCountryRates = (countryRates = []) =>
  Array.isArray(countryRates)
    ? countryRates
        .map((item) => ({
          country: String(item?.country || "").trim(),
          rate: toNumber(item?.rate, NaN),
        }))
        .filter((item) => item.country && Number.isFinite(item.rate) && item.rate >= 0 && item.rate <= 100)
    : [];

const getOrCreateConfig = async () => {
  let config = await CheckoutConfig.findOne({ key: "default" });

  if (config) {
    return config;
  }

  config = await CheckoutConfig.create(defaultConfigPayload);
  return config;
};

const resolveTaxRate = (config, country) => {
  const normalizedCountry = normalizeCountry(country);

  const countryRate = (config.tax.countryRates || []).find(
    (item) => normalizeCountry(item.country) === normalizedCountry,
  );

  return countryRate ? Number(countryRate.rate) : Number(config.tax.defaultRate || 0);
};

const serializeConfig = (config) => ({
  currency: config.currency,
  shipping: {
    flatRate: Number(config.shipping.flatRate || 0),
    freeShippingThreshold: Number(config.shipping.freeShippingThreshold || 0),
  },
  tax: {
    defaultRate: Number(config.tax.defaultRate || 0),
    countryRates: (config.tax.countryRates || []).map((item) => ({
      country: item.country,
      rate: Number(item.rate || 0),
    })),
  },
  updatedAt: config.updatedAt,
});

const getCheckoutConfig = async (_req, res, next) => {
  try {
    const config = await getOrCreateConfig();

    return res.status(200).json({
      success: true,
      item: serializeConfig(config),
    });
  } catch (error) {
    return next(error);
  }
};

const updateCheckoutConfig = async (req, res, next) => {
  try {
    const config = await getOrCreateConfig();
    const { currency, shipping, tax } = req.body || {};

    if (currency !== undefined) {
      const nextCurrency = String(currency || "").trim().toUpperCase();
      if (nextCurrency.length !== 3) {
        return res.status(400).json({ success: false, message: "currency must be a 3-letter code" });
      }

      config.currency = nextCurrency;
    }

    if (shipping && typeof shipping === "object") {
      if (shipping.flatRate !== undefined) {
        const flatRate = toNumber(shipping.flatRate, NaN);

        if (!Number.isFinite(flatRate) || flatRate < 0) {
          return res.status(400).json({ success: false, message: "shipping.flatRate must be a positive number" });
        }

        config.shipping.flatRate = flatRate;
      }

      if (shipping.freeShippingThreshold !== undefined) {
        const threshold = toNumber(shipping.freeShippingThreshold, NaN);

        if (!Number.isFinite(threshold) || threshold < 0) {
          return res.status(400).json({ success: false, message: "shipping.freeShippingThreshold must be a positive number" });
        }

        config.shipping.freeShippingThreshold = threshold;
      }
    }

    if (tax && typeof tax === "object") {
      if (tax.defaultRate !== undefined) {
        const defaultRate = toNumber(tax.defaultRate, NaN);

        if (!Number.isFinite(defaultRate) || defaultRate < 0 || defaultRate > 100) {
          return res.status(400).json({ success: false, message: "tax.defaultRate must be between 0 and 100" });
        }

        config.tax.defaultRate = defaultRate;
      }

      if (tax.countryRates !== undefined) {
        config.tax.countryRates = sanitizeCountryRates(tax.countryRates);
      }
    }

    await config.save();

    return res.status(200).json({
      success: true,
      item: serializeConfig(config),
    });
  } catch (error) {
    return next(error);
  }
};

const calculateCharges = async (req, res, next) => {
  try {
    const config = await getOrCreateConfig();
    const { subtotal, country } = req.body || {};

    const parsedSubtotal = toNumber(subtotal, NaN);

    if (!Number.isFinite(parsedSubtotal) || parsedSubtotal < 0) {
      return res.status(400).json({
        success: false,
        message: "subtotal must be a valid positive number",
      });
    }

    const effectiveCountry = String(country || "").trim() || "United States";
    const taxRate = resolveTaxRate(config, effectiveCountry);
    const shippingAmount = parsedSubtotal >= Number(config.shipping.freeShippingThreshold || 0)
      ? 0
      : Number(config.shipping.flatRate || 0);
    const taxAmount = Number(((parsedSubtotal * taxRate) / 100).toFixed(2));
    const total = Number((parsedSubtotal + shippingAmount + taxAmount).toFixed(2));

    return res.status(200).json({
      success: true,
      item: {
        currency: config.currency,
        country: effectiveCountry,
        subtotal: Number(parsedSubtotal.toFixed(2)),
        shippingAmount: Number(shippingAmount.toFixed(2)),
        taxRate: Number(taxRate.toFixed(2)),
        taxAmount,
        total,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCheckoutConfig,
  updateCheckoutConfig,
  calculateCharges,
};
