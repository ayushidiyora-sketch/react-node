import { getActiveRoleFromPath, getLegacyTokenKey, getTokenKey } from "../lib/authStorage.ts";

type SellerDashboard = {
  totalProducts: number;
  totalBrands: number;
  subscriptionPlan: string;
  planExpiryDate: string;
  recentProducts?: Array<{
    _id: string;
    name: string;
    status: "pending" | "approved" | "rejected";
    price: number;
    createdAt: string;
  }>;
};

type SellerProfile = {
  _id: string;
  sellerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  companyName: string;
  brandName: string;
  gstNumber?: string;
  websiteUrl?: string;
  profileImage?: string;
};

type CompanyInfo = {
  brandName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber?: string;
  websiteUrl?: string;
};

type SellerPlan = {
  planName: string;
  productLimit: number;
  brandLimit: number;
  durationDays: number;
  price: number;
};

type SubscriptionRequest = {
  _id: string;
  sellerName: string;
  planName: string;
  price?: number;
  productLimit: number;
  brandLimit: number;
  startDate: string;
  expiryDate: string;
  paymentStatus: "Pending" | "Paid" | "Rejected";
  status: "pending" | "approved" | "rejected";
  paymentGateway?: string;
  currency?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerEmail?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type SubscriptionCheckoutSession = {
  checkoutUrl: string;
  sessionId: string;
  requestId: string;
};

type SellerUser = {
  id: string;
  sellerName: string;
  email: string;
  profileImage?: string;
  phone: string;
  companyName: string;
  planName: string;
  status: string;
};

type SellerBrand = {
  _id: string;
  seller?: string;
  logo?: string;
  brandName: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  sellerName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  websiteUrl?: string;
  contactInfo?: {
    companyName?: string;
    email?: string;
    phone?: string;
    websiteUrl?: string;
    address?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

type CreateSellerBrandPayload = {
  brandName: string;
  logo?: string;
  description?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  address?: string;
};

type UpdateSellerBrandPayload = Partial<CreateSellerBrandPayload>;

type SellerProductPayload = {
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  rating?: number;
  description?: string;
  manufacturerName?: string;
  manufacturerBrand?: string;
  features?: string;
  featureImage?: string;
  gallery?: string[];
  specifications?: Array<{ title: string; value: string }>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  images?: string[];
  brandName?: string;
};

type SellerProduct = {
  _id: string;
  name: string;
  brandName: string;
  featureImage?: string;
  status?: "pending" | "approved" | "rejected";
  price?: number;
  salePrice?: number | null;
  rating?: number;
  category?: { _id: string; name: string } | string;
  createdAt: string;
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const getAuthToken = () => {
  const role = getActiveRoleFromPath();
  return localStorage.getItem(getTokenKey(role)) || localStorage.getItem(getLegacyTokenKey(role)) || "";
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const sellerPortalService = {
  register: async (payload: { fullName: string; email: string; phoneNumber: string; password: string; confirmPassword: string }) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to register seller");
    }

    return data;
  },

  getDashboard: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/dashboard`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; item?: SellerDashboard; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to fetch seller dashboard");
    }

    return data.item;
  },

  getProfile: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/profile`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; item?: SellerProfile; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to fetch profile");
    }

    return data.item;
  },

  updateProfile: async (payload: Partial<SellerProfile>) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/profile`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; item?: SellerProfile; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to update profile");
    }

    return data.item;
  },

  getCompanyInfo: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/company-info`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; item?: CompanyInfo; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to fetch company info");
    }

    return data.item;
  },

  updateCompanyInfo: async (payload: Partial<CompanyInfo>) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/company-info`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; item?: CompanyInfo; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to update company info");
    }

    return data.item;
  },

  getPlans: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/plans`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; items?: SellerPlan[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch plans");
    }

    return data.items;
  },

  requestPlan: async (planName: string) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/subscriptions/request`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ planName }),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to request plan");
    }

    return data;
  },

  createSubscriptionCheckout: async (planName: string, successUrl: string, cancelUrl: string) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/subscriptions/checkout`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ planName, successUrl, cancelUrl }),
    });

    const data = await parseJson<{ success: boolean; checkoutUrl?: string; sessionId?: string; requestId?: string; message?: string }>(response);

    if (!response.ok || !data.success || !data.checkoutUrl || !data.sessionId || !data.requestId) {
      throw new Error(data.message ?? "Failed to create checkout session");
    }

    return {
      checkoutUrl: data.checkoutUrl,
      sessionId: data.sessionId,
      requestId: data.requestId,
    } as SubscriptionCheckoutSession;
  },

  getMySubscriptions: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/subscriptions/me`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; items?: SubscriptionRequest[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch subscription history");
    }

    return data.items;
  },

  getAdminSubscriptions: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/subscriptions`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; items?: SubscriptionRequest[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch subscriptions");
    }

    return data.items;
  },

  updateAdminSubscriptionStatus: async (id: string, status: "approved" | "rejected") => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/subscriptions/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to update subscription status");
    }

    return data;
  },

  deleteAdminSubscription: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/subscriptions/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to delete subscription request");
    }

    return data;
  },

  getSellerUsers: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/users`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; items?: SellerUser[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch seller users");
    }

    return data.items;
  },

  getAdminBrands: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; items?: SellerBrand[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch seller brands");
    }

    return data.items;
  },

  getMyBrands: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands/me`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; items?: SellerBrand[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch your brands");
    }

    return data.items;
  },

  getMyBrandById: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands/me/${id}`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; item?: SellerBrand; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to fetch brand details");
    }

    return data.item;
  },

  createBrand: async (payload: CreateSellerBrandPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to create brand");
    }

    return data;
  },

  updateMyBrand: async (id: string, payload: UpdateSellerBrandPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands/me/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to update brand");
    }

    return data;
  },

  deleteMyBrand: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands/me/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to delete brand");
    }

    return data;
  },

  getAdminBrandById: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands/${id}`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; item?: SellerBrand; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to fetch brand details");
    }

    return data.item;
  },

  createAdminBrand: async (payload: { brandName: string; logo?: string; description?: string }) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands/admin`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to create brand");
    }

    return data;
  },

  updateAdminBrand: async (id: string, payload: { brandName?: string; logo?: string; description?: string }) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to update brand");
    }

    return data;
  },

  updateAdminBrandStatus: async (id: string, status: "approved" | "rejected") => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to update brand status");
    }

    return data;
  },

  deleteAdminBrand: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/brands/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to delete brand");
    }

    return data;
  },

  createProduct: async (payload: SellerProductPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/products`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to create product");
    }

    return data;
  },

  getMyProducts: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/products/me`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; items?: SellerProduct[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch products");
    }

    return data.items;
  },

  updateProduct: async (id: string, payload: SellerProductPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/products/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; message?: string; item?: SellerProduct }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to update product");
    }

    return data;
  },

  deleteProduct: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to delete product");
    }

    return data;
  },

  getLimits: async () => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/limits`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; item?: { planName: string; productLimit: number; brandLimit: number; productsCount: number; brandsCount: number; reachedProductLimit: boolean; reachedBrandLimit: boolean }; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to fetch limits");
    }

    return data.item;
  },
};

