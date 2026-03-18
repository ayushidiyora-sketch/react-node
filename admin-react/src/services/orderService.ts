export type AdminOrder = {
  _id: string;
  orderId?: string;
  customerName: string;
  email: string;
  address: string;
  products: Array<{
    productId?: string;
    name: string;
    image?: string;
    price: number;
    quantity: number;
  }>;
  subtotal?: number;
  shippingAmount?: number;
  taxAmount?: number;
  taxRate?: number;
  currency?: string;
  country?: string;
  totalPrice: number;
  paymentMethod: string;
  orderStatus: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const orderService = {
  list: async () => {
    const response = await fetch(`${apiBaseUrl}/api/orders`);
    const data = await parseJson<{ success: boolean; items?: AdminOrder[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch orders");
    }

    return data.items;
  },
  getById: async (orderId: string) => {
    const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}`);

    if (response.status === 404) {
      throw new Error("Order not found");
    }

    if (response.ok) {
      const data = await parseJson<{ success: boolean; item?: AdminOrder; message?: string }>(response);

      if (data.success && data.item) {
        return data.item;
      }

      throw new Error(data.message ?? "Failed to fetch order");
    }

    // Backward-compatible fallback for older API versions without /orders/:id.
    const items = await orderService.list();
    const order = items.find(item => item._id === orderId || item.orderId === orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  },
};