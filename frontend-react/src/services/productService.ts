import type { Product } from "@/lib/products";

export type StoreProductItem = {
  _id: string;
  name: string;
  category: { _id: string; name: string } | string;
  status?: "pending" | "approved" | "rejected";
  price: number;
  salePrice?: number | null;
  rating?: number;
  salesCount?: number;
  orderCount?: number;
  isPopular?: boolean;
  bestSelling?: boolean;
  description?: string;
  features?: string;
  featureImage?: string;
  gallery?: string[];
  specifications?: Array<{ title: string; value: string }>;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type HomeSectionProducts = {
  newArrivals: StoreProductItem[];
  gamerWorld: StoreProductItem[];
  topSelling: StoreProductItem[];
  popularSales: StoreProductItem[];
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";
const imageFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const stringToStableId = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) || 1;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

const fetchProductsByPath = async (path: string) => {
  const response = await fetch(`${apiBaseUrl}${path}`);
  const data = await parseJson<{ success: boolean; items: StoreProductItem[]; message?: string }>(response);

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "Failed to fetch products");
  }

  return data.items;
};

export const normalizeStoreProduct = (item: StoreProductItem, index: number): Product => {
  const categoryName = typeof item.category === "string" ? item.category : item.category?.name || "Uncategorized";
  const salePrice = item.salePrice ?? item.price;
  const originalPrice = salePrice < item.price ? item.price : Number((salePrice * 1.15).toFixed(2));
  const stableId = stringToStableId(item._id || `${item.name}-${index}`);
  const featureText = item.features?.toLowerCase() ?? "";

  return {
    id: stableId,
    backendId: item._id,
    slug: `${toSlug(item.name)}-${stableId}`,
    name: item.name,
    category: categoryName,
    image: item.featureImage || item.gallery?.[0] || item.images?.[0] || imageFallback,
    originalPrice,
    salePrice,
    badge: item.isPopular || featureText.includes("popular") ? "popular" : item.bestSelling || featureText.includes("new") ? "new" : null,
    stock: undefined,
    rating: item.rating ?? 0,
    shortDescription: item.description?.slice(0, 120) || "No description available.",
    description: item.description || "",
    specifications: (item.specifications || []).map(spec => ({
      label: spec.title,
      value: spec.value,
    })),
  };
};

export const productService = {
  list: async () => {
    return fetchProductsByPath("/api/products?status=approved");
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

    return data.urls;
  },

  getNewArrivals: async (limit = 8) => fetchProductsByPath(`/api/products/new-arrivals?limit=${limit}`),

  getGamerWorld: async (limit = 8) => fetchProductsByPath(`/api/products/gamer-world?limit=${limit}`),

  getTopSelling: async (limit = 8) => fetchProductsByPath(`/api/products/top-selling?limit=${limit}`),

  getPopularSales: async (limit = 8) => fetchProductsByPath(`/api/products/popular-sales?limit=${limit}`),

  getHomeSections: async (limit = 8): Promise<HomeSectionProducts> => {
    const [newArrivals, gamerWorld, topSelling, popularSales] = await Promise.all([
      productService.getNewArrivals(limit),
      productService.getGamerWorld(limit),
      productService.getTopSelling(limit),
      productService.getPopularSales(limit),
    ]);

    return {
      newArrivals,
      gamerWorld,
      topSelling,
      popularSales,
    };
  },
};