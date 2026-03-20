type ProductPayload = {
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  rating?: number;
  salesCount?: number;
  orderCount?: number;
  isPopular?: boolean;
  bestSelling?: boolean;
  description: string;
  manufacturerName: string;
  manufacturerBrand: string;
  features: string;
  featureImage?: string;
  gallery?: string[];
  specifications?: Array<{ title: string; value: string }>;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  images: string[];
};

export type ProductItem = {
  _id: string;
  name: string;
  category: { _id: string; name: string } | string;
  status?: "pending" | "approved" | "rejected";
  submittedByRole?: "admin" | "seller";
  sellerName?: string;
  price: number;
  salePrice?: number | null;
  rating?: number;
  salesCount?: number;
  orderCount?: number;
  isPopular?: boolean;
  bestSelling?: boolean;
  description: string;
  manufacturerName: string;
  manufacturerBrand: string;
  features: string;
  featureImage?: string;
  gallery?: string[];
  specifications?: Array<{ title: string; value: string }>;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

const apiBaseUrl = String(import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5001").replace(/\/$/, "");

const toAbsoluteProductImageUrl = (value?: string) => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("data:") || normalized.startsWith("blob:")) {
    return normalized;
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      const shouldRewriteLocalUploadUrl =
        ["localhost", "127.0.0.1"].includes(parsed.hostname) && parsed.pathname.startsWith("/uploads/");

      if (shouldRewriteLocalUploadUrl) {
        return `${apiBaseUrl}${parsed.pathname}`;
      }
    } catch {
      // Keep original value if URL parsing fails.
    }

    return normalized;
  }

  if (normalized.startsWith("/")) {
    return `${apiBaseUrl}${normalized}`;
  }

  return `${apiBaseUrl}/uploads/products/${normalized}`;
};

const normalizeProductItem = (item: ProductItem): ProductItem => ({
  ...item,
  featureImage: toAbsoluteProductImageUrl(item.featureImage),
  gallery: Array.isArray(item.gallery) ? item.gallery.map(image => toAbsoluteProductImageUrl(image)).filter(Boolean) : [],
  images: Array.isArray(item.images) ? item.images.map(image => toAbsoluteProductImageUrl(image)).filter(Boolean) : [],
});

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const productService = {
  list: async () => {
    const response = await fetch(`${apiBaseUrl}/api/products`);
    const data = await parseJson<{ success: boolean; items: ProductItem[]; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to fetch products");
    }

    return data.items.map(normalizeProductItem);
  },
  create: async (payload: ProductPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; item?: ProductItem; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to create product");
    }

    return normalizeProductItem(data.item);
  },
  update: async (id: string, payload: ProductPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; item?: ProductItem; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to update product");
    }

    return normalizeProductItem(data.item);
  },
  updateStatus: async (id: string, status: "pending" | "approved" | "rejected") => {
    const response = await fetch(`${apiBaseUrl}/api/products/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await parseJson<{ success: boolean; item?: ProductItem; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to update product status");
    }

    return normalizeProductItem(data.item);
  },
  remove: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/products/${id}`, {
      method: "DELETE",
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to delete product");
    }
  },
  uploadImages: async (files: File[]) => {
    if (!files.length) {
      return [] as string[];
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append("images", file);
    });

    const response = await fetch(`${apiBaseUrl}/api/products/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await parseJson<{ success: boolean; urls?: string[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.urls) {
      throw new Error(data.message ?? "Failed to upload images");
    }

    return data.urls.map(url => toAbsoluteProductImageUrl(url)).filter(Boolean);
  },
};
