const Order = require("../models/Order");
const Product = require("../models/Product");

const stringToStableId = (value) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) || 1;
};

const normalizeName = (value) => String(value || "").trim().toLowerCase();
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pickProductImage = (product) => product?.featureImage || product?.gallery?.[0] || product?.images?.[0] || "";

const mapOrder = (order) => ({
  _id: order._id,
  orderId: order.orderId,
  customerName: order.customerName,
  email: order.email,
  address: order.address,
  products: order.products,
  totalPrice: order.totalPrice,
  subtotal: order.subtotal,
  shippingAmount: order.shippingAmount,
  taxAmount: order.taxAmount,
  taxRate: order.taxRate,
  currency: order.currency,
  country: order.country,
  paymentMethod: order.paymentMethod,
  orderStatus: order.orderStatus,
  orderDate: order.orderDate,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const createOrder = async (req, res, next) => {
  try {
    const {
      orderId,
      customerName,
      email,
      address,
      products,
      totalPrice,
      subtotal,
      shippingAmount,
      taxAmount,
      taxRate,
      currency,
      country,
      paymentMethod,
      orderDate,
    } = req.body;

    if (!customerName || !email || !address || !Array.isArray(products) || products.length === 0 || totalPrice === undefined || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          "customerName, email, address, products, totalPrice, and paymentMethod are required",
      });
    }

    const sanitizedProducts = products.map((item) => {
      const parsedProductId = Number(item.productId);

      return {
        productId: Number.isInteger(parsedProductId) && parsedProductId > 0 ? parsedProductId : null,
        name: String(item.name || "").trim(),
        image: String(item.image || "").trim(),
        price: Number(item.price),
        quantity: Number(item.quantity),
      };
    });

    const hasInvalidProduct = sanitizedProducts.some(
      (item) => !item.name || !Number.isFinite(item.price) || item.price < 0 || !Number.isInteger(item.quantity) || item.quantity < 1,
    );

    if (hasInvalidProduct) {
      return res.status(400).json({
        success: false,
        message: "Each product must include valid name, price, and quantity",
      });
    }

    const parsedTotalPrice = Number(totalPrice);
    const computedSubtotal = Number(
      sanitizedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
    );
    const parsedSubtotal = Number.isFinite(Number(subtotal)) ? Number(subtotal) : computedSubtotal;
    const parsedShippingAmount = Number.isFinite(Number(shippingAmount)) ? Number(shippingAmount) : 0;
    const parsedTaxAmount = Number.isFinite(Number(taxAmount)) ? Number(taxAmount) : 0;
    const parsedTaxRate = Number.isFinite(Number(taxRate)) ? Number(taxRate) : 0;

    if (!Number.isFinite(parsedTotalPrice) || parsedTotalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "totalPrice must be a valid positive number",
      });
    }

    if (parsedSubtotal < 0 || parsedShippingAmount < 0 || parsedTaxAmount < 0 || parsedTaxRate < 0 || parsedTaxRate > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtotal/shipping/tax values",
      });
    }

    const order = await Order.create({
      orderId: String(orderId || "").trim(),
      customerName: String(customerName).trim(),
      email: String(email).trim().toLowerCase(),
      address: String(address).trim(),
      products: sanitizedProducts,
      totalPrice: parsedTotalPrice,
      subtotal: Number(parsedSubtotal.toFixed(2)),
      shippingAmount: Number(parsedShippingAmount.toFixed(2)),
      taxAmount: Number(parsedTaxAmount.toFixed(2)),
      taxRate: Number(parsedTaxRate.toFixed(2)),
      currency: String(currency || "USD").trim().toUpperCase(),
      country: String(country || "").trim(),
      paymentMethod: String(paymentMethod).trim(),
      orderStatus: "Pending",
      orderDate: orderDate ? new Date(orderDate) : new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Order created",
      item: mapOrder(order),
    });
  } catch (error) {
    return next(error);
  }
};

const getOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      items: orders.map(mapOrder),
    });
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const missingImageItems = order.products.filter(item => !String(item.image || "").trim());

    if (missingImageItems.length > 0) {
      const lookupIds = new Set();
      const lookupNames = new Set();

      missingImageItems.forEach((item) => {
        const rawProductId = String(item.productId || "").trim();

        if (rawProductId) {
          lookupIds.add(rawProductId);
        }

        const normalizedName = normalizeName(item.name);
        if (normalizedName) {
          lookupNames.add(normalizedName);
        }
      });

      const objectIdCandidates = Array.from(lookupIds).filter((id) => /^[a-f0-9]{24}$/i.test(id));
      const stableIdCandidates = new Set(Array.from(lookupIds).filter((id) => /^\d+$/.test(id)).map((id) => Number(id)));

      const nameClauses = Array.from(lookupNames).map((name) => ({
        name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      }));

      const query = {
        $or: [
          ...(objectIdCandidates.length > 0 ? [{ _id: { $in: objectIdCandidates } }] : []),
          ...nameClauses,
        ],
      };

      const candidateProducts = query.$or.length > 0
        ? await Product.find(query).select("_id name featureImage gallery images")
        : await Product.find({}).select("_id name featureImage gallery images");

      const byObjectId = new Map(candidateProducts.map((product) => [String(product._id), product]));
      const byStableId = new Map(candidateProducts.map((product) => [stringToStableId(String(product._id)), product]));
      const byName = new Map(candidateProducts.map((product) => [normalizeName(product.name), product]));

      order.products = order.products.map((item) => {
        const existingImage = String(item.image || "").trim();

        if (existingImage) {
          return item;
        }

        const rawProductId = String(item.productId || "").trim();
        const normalizedName = normalizeName(item.name);
        let matchedProduct = null;

        if (rawProductId && byObjectId.has(rawProductId)) {
          matchedProduct = byObjectId.get(rawProductId);
        }

        if (!matchedProduct && rawProductId && /^\d+$/.test(rawProductId)) {
          matchedProduct = byStableId.get(Number(rawProductId)) || null;
        }

        if (!matchedProduct && normalizedName) {
          matchedProduct = byName.get(normalizedName) || null;
        }

        const fallbackImage = pickProductImage(matchedProduct);

        return {
          ...item,
          image: fallbackImage,
        };
      });
    }

    return res.status(200).json({
      success: true,
      item: mapOrder(order),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
};