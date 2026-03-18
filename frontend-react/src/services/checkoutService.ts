type CalculateChargesPayload = {
  subtotal: number;
  country?: string;
};

export type ChargeSummary = {
  currency: string;
  country: string;
  subtotal: number;
  shippingAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const checkoutService = {
  calculateCharges: async (payload: CalculateChargesPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/checkout/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; item?: ChargeSummary; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to calculate checkout charges");
    }

    return data.item;
  },
};
