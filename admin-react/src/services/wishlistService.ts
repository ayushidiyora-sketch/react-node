type WishlistProduct = {
  _id: string;
  product: {
    _id: string;
    name: string;
    category: { _id: string; name: string } | string;
    price: number;
    salePrice?: number | null;
    featureImage?: string;
    images?: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const wishlistService = {
  list: async () => {
    const response = await fetch(`${apiBaseUrl}/api/wishlist/products`);
    const data = await parseJson<{ success: boolean; items: WishlistProduct[]; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to fetch wishlist products");
    }

    return data.items;
  },
  add: async (productId: string) => {
    const response = await fetch(`${apiBaseUrl}/api/wishlist/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    const data = await parseJson<{ success: boolean; item?: WishlistProduct | null; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to add product to wishlist");
    }

    return data.item ?? null;
  },
  remove: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/wishlist/products/${id}`, {
      method: "DELETE",
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to remove wishlist product");
    }
  },
};

export type { WishlistProduct };
