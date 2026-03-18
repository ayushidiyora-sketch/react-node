import { getLegacyTokenKey, getTokenKey, type UserRole } from "../lib/authStorage.ts";

type NotificationAction = "add" | "edit" | "delete";
type NotificationItemType = "product" | "brand";

export type AdminNotification = {
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

const authHeaders = (role: UserRole = "admin") => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem(getTokenKey(role)) || localStorage.getItem(getLegacyTokenKey(role)) || ""}`,
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
  getNotifications: async (options?: GetNotificationsOptions, role: UserRole = "admin") => {
    const response = await fetch(`${apiBaseUrl}/api/notifications${buildQuery(options)}`, {
      headers: authHeaders(role),
    });

    const data = await parseJson<{ success: boolean; items?: AdminNotification[]; message?: string }>(response);

    if (!response.ok || !data.success || !data.items) {
      throw new Error(data.message ?? "Failed to fetch notifications");
    }

    return data.items;
  },

  getUnreadCount: async (role: UserRole = "admin") => {
    const response = await fetch(`${apiBaseUrl}/api/notifications/unread-count`, {
      headers: authHeaders(role),
    });

    const data = await parseJson<{ success: boolean; item?: { count: number }; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to fetch unread count");
    }

    return data.item.count;
  },

  markAsRead: async (id: string, role: UserRole = "admin") => {
    const response = await fetch(`${apiBaseUrl}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(role),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to mark notification as read");
    }

    return data;
  },

  markAllAsRead: async (role: UserRole = "admin") => {
    const response = await fetch(`${apiBaseUrl}/api/notifications/read-all`, {
      method: "PATCH",
      headers: authHeaders(role),
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to mark all notifications as read");
    }

    return data;
  },
};
