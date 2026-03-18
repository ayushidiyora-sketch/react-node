import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { toast } from "@/components/ui/sonner";
import { commerceApi, type ApiCartItem } from "@/lib/api";
import { type Product, getProductById } from "@/lib/products";

const CART_STORAGE_KEY = "shopo-cart-items";

export type CartItem = Product & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const loadInitialItems = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedItems = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!storedItems) {
      return [];
    }

    const parsedItems = JSON.parse(storedItems) as CartItem[];

    if (!Array.isArray(parsedItems)) {
      return [];
    }

    return parsedItems.filter(item => typeof item.id === "number" && typeof item.quantity === "number" && item.quantity > 0);
  } catch {
    return [];
  }
};

const mapCartItems = (items: ApiCartItem[]) =>
  items
    .map(item => {
      const product = getProductById(item.productId);

      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter((item): item is CartItem => Boolean(item));

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadInitialItems);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    let isActive = true;

    const syncCart = async () => {
      try {
        const response = await commerceApi.getCart();

        if (isActive) {
          setItems(mapCartItems(response.items));
        }
      } catch {
        // Keep local cart state when the API is unavailable.
      }
    };

    void syncCart();

    return () => {
      isActive = false;
    };
  }, []);

  const addItem = async (product: Product, quantity = 1) => {
    const nextItems = (() => {
      const existingItem = items.find(item => item.id === product.id);

      if (existingItem) {
        return items.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }

      return [...items, { ...product, quantity }];
    })();

    setItems(nextItems);

    try {
      const response = await commerceApi.addToCart(product.id, quantity);
      setItems(mapCartItems(response.items));
    } catch {
      toast.message("Cart saved locally.", {
        description: "Start the API server to persist cart data to MongoDB.",
      });
    }

    toast.success(`${product.name} added to cart.`);
  };

  const removeItem = async (productId: number) => {
    const nextItems = items.filter(item => item.id !== productId);
    setItems(nextItems);

    try {
      const response = await commerceApi.removeCartItem(productId);
      setItems(mapCartItems(response.items));
    } catch {
      // Keep the locally updated state if the API is unavailable.
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    const nextItems = quantity <= 0
      ? items.filter(item => item.id !== productId)
      : items.map(item => (item.id === productId ? { ...item, quantity } : item));

    setItems(nextItems);

    try {
      const response = quantity <= 0
        ? await commerceApi.removeCartItem(productId)
        : await commerceApi.updateCartItem(productId, quantity);

      setItems(mapCartItems(response.items));
    } catch {
      // Keep the locally updated state if the API is unavailable.
    }
  };

  const clearCart = async () => {
    setItems([]);

    // Only attempt to delete from the catalog API server for items that came from it
    // (no backendId). Products from the shopo-backend use derived numeric IDs that
    // the old catalog server doesn't track — calling DELETE on them causes 500 errors
    // from the Vite proxy when that server is not running.
    void Promise.all(
      items
        .filter(item => !item.backendId)
        .map(item => commerceApi.removeCartItem(item.id).catch(() => undefined)),
    );
  };

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.salePrice * item.quantity, 0),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
};