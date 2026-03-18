type CreateOrderPayload = {
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
  orderDate?: string;
};

type OrderResponse = {
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
  create: async (payload: CreateOrderPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; item?: OrderResponse; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to place order");
    }

    return data.item;
  },
};