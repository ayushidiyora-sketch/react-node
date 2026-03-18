type Category = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const categoryService = {
  list: async () => {
    const response = await fetch(`${apiBaseUrl}/api/categories`);
    const data = await parseJson<{ success: boolean; items: Category[]; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to fetch categories");
    }

    return data.items;
  },

  create: async (payload: { name: string; description: string }) => {
    const response = await fetch(`${apiBaseUrl}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; item?: Category; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to create category");
    }

    return data.item;
  },

  update: async (id: string, payload: { name: string; description: string }) => {
    const response = await fetch(`${apiBaseUrl}/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ success: boolean; item?: Category; message?: string }>(response);

    if (!response.ok || !data.success || !data.item) {
      throw new Error(data.message ?? "Failed to update category");
    }

    return data.item;
  },

  remove: async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/categories/${id}`, {
      method: "DELETE",
    });

    const data = await parseJson<{ success: boolean; message?: string }>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Failed to delete category");
    }
  },
};

export type { Category };
