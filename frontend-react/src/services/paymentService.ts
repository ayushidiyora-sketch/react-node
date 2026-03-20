type CreatePaymentIntentPayload = {
  amount: number;
  currency?: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
};

type PaymentConfig = {
  stripePublishableKey: string;
  stripeEnabled: boolean;
  paypalClientId: string;
  paypalEnabled: boolean;
};

const apiBaseUrl = String(import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000").replace(/\/$/, "");

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const paymentService = {
  getPaymentConfig: async () => {
    const response = await fetch(`${apiBaseUrl}/api/payments/config`);
    const data = await parseJson<{ success: boolean; item?: PaymentConfig; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to load payment configuration");
    }

    return data.item;
  },

  createPaymentIntent: async (payload: CreatePaymentIntentPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/payments/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; clientSecret?: string; paymentIntentId?: string; message?: string }>(response);

    if (!response.ok || !data.success || !data.clientSecret) {
      throw new Error(data.message ?? "Failed to initialize payment");
    }

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  },
  
  createPayPalOrder: async (payload: CreatePaymentIntentPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/payments/create-paypal-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    const data = await parseJson<{ success: boolean; orderId?: string; message?: string }>(response);
  
    if (!response.ok || !data.success || !data.orderId) {
      throw new Error(data.message ?? "Failed to create PayPal order");
    }
  
    return {
      orderId: data.orderId,
    };
  },
  
  capturePayPalOrder: async (paypalOrderId: string) => {
    const response = await fetch(`${apiBaseUrl}/api/payments/capture-paypal-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paypalOrderId }),
    });
  
    const data = await parseJson<{ success: boolean; status?: string; paypalOrderId?: string; message?: string }>(response);
  
    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to capture PayPal payment");
    }
  
    return {
      status: data.status,
      orderId: data.paypalOrderId,
    };
  },
};