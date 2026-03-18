type NotificationAction = "add" | "edit" | "delete";
type NotificationItemType = "product" | "brand";

export type AppNotification = {
  _id: string;
  sellerId: string;
  sellerName: string;
  action: NotificationAction;
  itemType: NotificationItemType;
  itemId: string;
  itemName: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

type GetNotificationsOptions = {
  action?: NotificationAction;
  isRead?: boolean;
  limit?: number;
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const getAuthToken = () => {
  const path = window.location.pathname.toLowerCase();
  const isSellerRoute = path.includes("/seller");

  if (isSellerRoute) {
    return localStorage.getItem("sellerToken") || localStorage.getItem("seller-token") || "";
  }

  return localStorage.getItem("adminToken") || localStorage.getItem("admin-token") || localStorage.getItem("sellerToken") || "";
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

const buildQuery = (options?: GetNotificationsOptions) => {
  const params = new URLSearchParams();

  if (!options) {
    return "";
  }

  if (options.action) {
    params.set("action", options.action);
  }

  if (options.isRead !== undefined) {
    params.set("isRead", options.isRead ? "true" : "false");
  }

  if (options.limit && options.limit > 0) {
    params.set("limit", String(options.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const notificationService = {
  getNotifications: async (options?: GetNotificationsOptions) => {
    const response = await fetch(`${apiBaseUrl}/api/notifications${buildQuery(options)}`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; items?: AppNotification[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch notifications");
    }

    return data.items;
  },

  getUnreadCount: async () => {
    const response = await fetch(`${apiBaseUrl}/api/notifications/unread-count`, {
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; item?: { count: number }; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to fetch unread count");
    }

    return data.item.count;
  },

  markAsRead: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to mark notification as read");
    }

    return data;
  },

  markAllAsRead: async () => {
    const response = await fetch(`${apiBaseUrl}/api/notifications/read-all`, {
      method: "PATCH",
      headers: authHeaders(),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to mark all notifications as read");
    }

    return data;
  },
};
