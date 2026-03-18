const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

type LoginPayload = {
  email: string;
  password: string;
};

type SellerRegisterPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

type LoginResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "seller" | "user";
    mustChangePassword?: boolean;
  };
};

type SellerRegisterResponse = {
  success: boolean;
  message?: string;
  item?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

const loginByEndpoint = async (endpoint: string, payload: LoginPayload) => {
  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson<LoginResponse>(response);

  if (!response.ok || !data.success || !data.token || !data.user) {
    throw new Error(data.message ?? "Login failed");
  }

  return {
    token: data.token,
    user: data.user,
    message: data.message ?? "Login successful",
  };
};

export const panelAuthService = {
  adminLogin: async (payload: LoginPayload) => loginByEndpoint("/api/auth/admin/login", payload),
  sellerLogin: async (payload: LoginPayload) => loginByEndpoint("/api/auth/seller/login", payload),
  sellerRegister: async (payload: SellerRegisterPayload) => {
    const response = await fetch(`${apiBaseUrl}/api/sellers/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<SellerRegisterResponse>(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? "Seller registration failed");
    }

    return data;
  },
};
