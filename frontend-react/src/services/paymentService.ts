type CreatePaymentIntentPayload = {
  amount: number;
  currency?: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const paymentService = {
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
};