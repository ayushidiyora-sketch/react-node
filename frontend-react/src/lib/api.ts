type ApiCartItem = {
  productId: number;
  quantity: number;
};

type ApiWishlistItem = {
  productId: number;
};

type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  badge?: "new" | "popular" | null;
  stock?: number;
  rating: number;
  shortDescription: string;
  description: string;
  specifications: Array<{
    label: string;
    value: string;
  }>;
};

const configuredBackendUrl = String(import.meta.env.VITE_BACKEND_URL ?? "").trim().replace(/\/$/, "");
const API_BASE_URL = configuredBackendUrl
  ? `${configuredBackendUrl}/api`
  : (import.meta.env.VITE_API_BASE_URL ?? "/api");

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const commerceApi = {
  getProducts: () => request<{ products: ApiProduct[] }>("/products"),
  getProductBySlug: (slug: string) => request<{ product: ApiProduct | null }>(`/products/${slug}`),
  getCart: () => request<{ items: ApiCartItem[] }>("/cart"),
  addToCart: (productId: number, quantity = 1) =>
    request<{ items: ApiCartItem[] }>("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  updateCartItem: (productId: number, quantity: number) =>
    request<{ items: ApiCartItem[] }>(`/cart/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (productId: number) =>
    request<{ items: ApiCartItem[] }>(`/cart/${productId}`, {
      method: "DELETE",
    }),
  getWishlist: () => request<{ items: ApiWishlistItem[] }>("/wishlist"),
  addToWishlist: (productId: number) =>
    request<{ items: ApiWishlistItem[] }>("/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  removeFromWishlist: (productId: number) =>
    request<{ items: ApiWishlistItem[] }>(`/wishlist/${productId}`, {
      method: "DELETE",
    }),
};

export type { ApiCartItem, ApiProduct, ApiWishlistItem };