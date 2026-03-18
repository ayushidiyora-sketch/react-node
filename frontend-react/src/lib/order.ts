export const LAST_ORDER_STORAGE_KEY = "shopo-last-order";

export type SavedOrder = {
  id: string;
  placedAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    grandTotal: number;
  };
};

export const saveLastOrder = (order: SavedOrder) => {
  window.localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
};

export const getLastOrder = (): SavedOrder | null => {
  try {
    const storedOrder = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);

    if (!storedOrder) {
      return null;
    }

    return JSON.parse(storedOrder) as SavedOrder;
  } catch {
    return null;
  }
};