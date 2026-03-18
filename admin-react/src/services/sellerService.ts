import { getLegacyTokenKey, getTokenKey } from "../lib/authStorage.ts";

export type SellerApplication = {
  _id: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  taxId?: string;
  address?: string;
  message?: string;
  kycDocuments?: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

type SellerCredentials = {
  email: string;
  password: string;
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const getAuthToken = () => localStorage.getItem(getTokenKey("admin")) || localStorage.getItem(getLegacyTokenKey("admin")) || "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const sellerService = {
  list: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/applications`, {
      headers: authHeaders(),
    });
    const data = await parseJson<{ success: boolean; items: SellerApplication[]; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to fetch seller applications");
    }

    return data.items;
  },

  updateStatus: async (id: string, status: SellerApplication["status"]) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/applications/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await parseJson<{ success: boolean; item?: SellerApplication; credentials?: SellerCredentials; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to update seller status");
    }

    return {
      item: data.item,
      credentials: data.credentials,
    };
  },
};
