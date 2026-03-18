export type SellerApplicationPayload = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  taxId?: string;
  address?: string;
  message?: string;
  kycFiles?: File[];
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const sellerService = {
  apply: async (payload: SellerApplicationPayload) => {
    const formData = new FormData();
    formData.append("fullName", payload.fullName);
    formData.append("businessName", payload.businessName);
    formData.append("email", payload.email);
    formData.append("phone", payload.phone);
    formData.append("taxId", payload.taxId || "");
    formData.append("address", payload.address || "");
    formData.append("message", payload.message || "");

    (payload.kycFiles || []).forEach(file => {
      formData.append("kycFiles", file);
    });

    const response = await fetch(`${apiBaseUrl}/api/sellers/apply`, {
      method: "POST",
      body: formData,
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to submit seller application");
    }

    return data;
  },
};
