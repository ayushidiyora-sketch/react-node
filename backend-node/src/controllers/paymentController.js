const Stripe = require("stripe");

const getPayPalApiBase = () => {
  const mode = String(process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  return mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
};

const getPayPalAccessToken = async () => {
  const clientId = String(process.env.PAYPAL_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.PAYPAL_CLIENT_SECRET || "").trim();

  if (!clientId || !clientSecret) {
    return {
      ok: false,
      message: "PayPal credentials are missing on the server",
    };
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenResponse = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    return {
      ok: false,
      message: tokenData?.error_description || tokenData?.error || "Failed to authenticate with PayPal",
      details: tokenData,
    };
  }

  return {
    ok: true,
    accessToken: tokenData.access_token,
  };
};

const getPaymentConfig = async (_req, res) => {
  const publishableKey = String(process.env.STRIPE_PUBLISHABLE_KEY || "").trim();

  return res.status(200).json({
    success: true,
    item: {
      stripePublishableKey: publishableKey,
      stripeEnabled: Boolean(publishableKey),
      paypalClientId: String(process.env.PAYPAL_CLIENT_ID || "").trim(),
      paypalEnabled: Boolean(String(process.env.PAYPAL_CLIENT_ID || "").trim()),
    },
  });
};

const createPaymentIntent = async (req, res, next) => {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured on the server",
      });
    }

    const { amount, currency = "usd", orderId, customerEmail, metadata } = req.body;
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid amount is required",
      });
    }

    const stripe = new Stripe(secretKey);
    const amountInCents = Math.round(parsedAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: String(currency).toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail || undefined,
      metadata: {
        orderId: orderId || "",
        ...(metadata || {}),
      },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    return next(error);
  }
};

const createPayPalOrder = async (req, res, next) => {
  try {
    const { amount, currency = "USD", orderId } = req.body;
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid amount is required",
      });
    }

    const tokenResult = await getPayPalAccessToken();

    if (!tokenResult.ok) {
      return res.status(500).json({
        success: false,
        message: tokenResult.message,
        details: tokenResult.details,
      });
    }

    // Create PayPal order
    const orderResponse = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResult.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: String(currency).toUpperCase(),
              value: parsedAmount.toString(),
            },
            description: `Order ${orderId || ""}`,
          },
        ],
        application_context: {
          return_url: `${process.env.FRONTEND_URL || "http://localhost:8080"}/checkout?paypal_success=true`,
          cancel_url: `${process.env.FRONTEND_URL || "http://localhost:8080"}/checkout?paypal_canceled=true`,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok || !orderData.id) {
      return res.status(500).json({
        success: false,
        message: orderData?.message || orderData?.details?.[0]?.description || "Failed to create PayPal order",
        details: orderData,
      });
    }

    return res.status(200).json({
      success: true,
      orderId: orderData.id,
    });
  } catch (error) {
    return next(error);
  }
};

const capturePayPalOrder = async (req, res, next) => {
  try {
    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({
        success: false,
        message: "PayPal order ID is required",
      });
    }

    const tokenResult = await getPayPalAccessToken();

    if (!tokenResult.ok) {
      return res.status(500).json({
        success: false,
        message: tokenResult.message,
        details: tokenResult.details,
      });
    }

    // Capture PayPal order
    const captureResponse = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResult.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok || !captureData.id || captureData.status !== "COMPLETED") {
      return res.status(500).json({
        success: false,
        message: captureData?.message || captureData?.details?.[0]?.description || "Failed to capture PayPal payment",
        details: captureData,
      });
    }

    return res.status(200).json({
      success: true,
      paypalOrderId: captureData.id,
      status: captureData.status,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPaymentConfig,
  createPaymentIntent,
  createPayPalOrder,
  capturePayPalOrder,
};