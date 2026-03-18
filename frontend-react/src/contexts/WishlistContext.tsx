import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { toast } from "@/components/ui/sonner";
import { type Product } from "@/lib/products";
import { wishlistService, type WishlistApiItem } from "@/services/wishlistService";

const WISHLIST_STORAGE_KEY = "shopo-wishlist-items";

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

type WishlistContextValue = {
  items: Product[];
  itemCount: number;
  isInWishlist: (productId: number) => boolean;
  toggleItem: (product: Product) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

const loadInitialWishlist = (): Product[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedItems = window.localStorage.getItem(WISHLIST_STORAGE_KEY);

    if (!storedItems) {
      return [];
    }

    const parsedItems = JSON.parse(storedItems) as Product[];

    if (!Array.isArray(parsedItems)) {
      return [];
    }

    return parsedItems.filter(item => typeof item.id === "number");
  } catch {
    return [];
  }
};

const mapWishlistItems = (items: WishlistApiItem[]): Product[] =>
  items
    .filter((item): item is WishlistApiItem & { product: NonNullable<WishlistApiItem["product"]> } => Boolean(item.product))
    .map(item => {
      const categoryName = typeof item.product.category === "string" ? item.product.category : item.product.category?.name || "Uncategorized";
      const salePrice = item.product.salePrice ?? item.product.price;
      const originalPrice = salePrice < item.product.price ? item.product.price : Number((salePrice * 1.15).toFixed(2));
      const stableId = stringToStableId(item.product._id);

      return {
        id: stableId,
        backendId: item.product._id,
        wishlistItemId: item._id,
        slug: `${toSlug(item.product.name)}-${stableId}`,
        name: item.product.name,
        category: categoryName,
        image: item.product.featureImage || item.product.images?.[0] || imageFallback,
        originalPrice,
        salePrice,
        badge: null,
        stock: undefined,
        rating: 0,
        shortDescription: "No description available.",
        description: "",
        specifications: [],
      };
    });

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Product[]>(loadInitialWishlist);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    let isActive = true;

    const syncWishlist = async () => {
      try {
        const items = await wishlistService.list();

        if (isActive) {
          setItems(mapWishlistItems(items));
        }
      } catch {
        // Keep local wishlist state when the API is unavailable.
      }
    };

    void syncWishlist();

    return () => {
      isActive = false;
    };
  }, []);

  const isInWishlist = (productId: number) => items.some(item => item.id === productId);

  const toggleItem = async (product: Product) => {
    const exists = isInWishlist(product.id);
    const nextItems = exists ? items.filter(item => item.id !== product.id) : [...items, product];
    setItems(nextItems);

    try {
      if (!product.backendId) {
        toast.success(exists ? `${product.name} removed from wishlist.` : `${product.name} saved to wishlist.`);
        return;
      }

      if (exists) {
        const current = items.find(item => item.id === product.id || item.backendId === product.backendId);

        if (current?.wishlistItemId) {
          await wishlistService.remove(current.wishlistItemId);
        } else {
          const list = await wishlistService.list();
          const matched = list.find(item => item.product?._id === product.backendId);

          if (matched) {
            await wishlistService.remove(matched._id);
          }
        }
      } else {
        await wishlistService.add(product.backendId);
      }

      const syncedItems = await wishlistService.list();
      setItems(mapWishlistItems(syncedItems));
      toast.success(exists ? `${product.name} removed from wishlist.` : `${product.name} saved to wishlist.`);
    } catch {
      toast.message("Wishlist saved locally.", {
        description: "Start the backend server to persist wishlist data to MongoDB.",
      });
    }
  };

  const removeItem = async (productId: number) => {
    const target = items.find(item => item.id === productId);
    const nextItems = items.filter(item => item.id !== productId);
    setItems(nextItems);

    try {
      if (target?.wishlistItemId) {
        await wishlistService.remove(target.wishlistItemId);
      }

      const syncedItems = await wishlistService.list();
      setItems(mapWishlistItems(syncedItems));
    } catch {
      // Keep the locally updated state if the API is unavailable.
    }
  };

  const value = useMemo(
    () => ({
      items,
      itemCount: items.length,
      isInWishlist,
      toggleItem,
      removeItem,
    }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider.");
  }

  return context;
};