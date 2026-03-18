type LoginPayload = {
  email: string;
  password: string;
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

type UpdateProfilePayload = {
  name: string;
  email: string;
};

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
};

type AuthResponse = {
  token: string;
  admin: AdminProfile;
};

type ProfileApiResponse = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "seller";
    mustChangePassword?: boolean;
  };
};

type MockAdmin = AdminProfile & {
  password: string;
};

const adminStorageKey = "admin-shopo-mock-admin";
const resetTokenStorageKey = "admin-shopo-reset-token";
const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

const delay = async (milliseconds = 250) =>
  new Promise<void>(resolve => {
    window.setTimeout(resolve, milliseconds);
  });

const getDefaultAdmin = (): MockAdmin => ({
  id: "admin-1",
  name: "ShopO Super Admin",
  email: "admin@shopo.com",
  role: "admin",
  password: "Admin@123",
});

const getMockAdmin = (): MockAdmin => {
  const raw = localStorage.getItem(adminStorageKey);

  if (!raw) {
    const defaultAdmin = getDefaultAdmin();
    localStorage.setItem(adminStorageKey, JSON.stringify(defaultAdmin));
    return defaultAdmin;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MockAdmin>;

    if (parsed.id && parsed.name && parsed.email && parsed.password) {
      return {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        password: parsed.password,
        role: parsed.role === "seller" ? "seller" : "admin",
      };
    }

    const defaultAdmin = getDefaultAdmin();
    localStorage.setItem(adminStorageKey, JSON.stringify(defaultAdmin));
    return defaultAdmin;
  } catch {
    const defaultAdmin = getDefaultAdmin();
    localStorage.setItem(adminStorageKey, JSON.stringify(defaultAdmin));
    return defaultAdmin;
  }
};

const saveMockAdmin = (admin: MockAdmin) => {
  localStorage.setItem(adminStorageKey, JSON.stringify(admin));
};

const createAuthResponse = (admin: MockAdmin): AuthResponse => ({
  token: `mock-token-${admin.id}`,
  admin: {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  },
});

export const authService = {
  login: async (payload: LoginPayload) => {
    await delay();
    const admin = getMockAdmin();

    if (payload.email !== admin.email || payload.password !== admin.password) {
      throw new Error("Invalid credentials");
    }

    return createAuthResponse(admin);
  },
  googleLogin: async () => {
    await delay();
    const admin: MockAdmin = {
      id: "admin-google-1",
      name: "Google Admin",
      email: "admin.google@shopo.com",
      role: "admin",
      password: "Admin@123",
    };

    saveMockAdmin(admin);
    return createAuthResponse(admin);
  },
  forgotPassword: async (email: string) => {
    await delay();
    const admin = getMockAdmin();

    if (email !== admin.email) {
      return { message: "If account exists, reset link has been sent.", resetToken: "N/A" };
    }

    const resetToken = `reset-${Date.now()}`;
    localStorage.setItem(resetTokenStorageKey, resetToken);
    return { message: "Reset token generated.", resetToken };
  },
  resetPassword: async (token: string, password: string) => {
    await delay();
    const expectedToken = localStorage.getItem(resetTokenStorageKey);

    if (!expectedToken || token !== expectedToken) {
      throw new Error("Invalid reset token");
    }

    const admin = getMockAdmin();
    const updatedAdmin = { ...admin, password };
    saveMockAdmin(updatedAdmin);
    localStorage.removeItem(resetTokenStorageKey);

    return { message: "Password reset successful" };
  },
  changePassword: async (payload: ChangePasswordPayload) => {
    await delay();
    const admin = getMockAdmin();

    if (payload.currentPassword !== admin.password) {
      throw new Error("Current password is incorrect");
    }

    saveMockAdmin({ ...admin, password: payload.newPassword });
    return { message: "Password changed" };
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = (await response.json()) as ProfileApiResponse;

    if (!response.ok || !data.success || !data.user) {
      throw new Error(data.message ?? "Failed to load profile");
    }

    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      mustChangePassword: Boolean(data.user.mustChangePassword),
    };
  },

  updateProfile: async (token: string, payload: UpdateProfilePayload) => {
    const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as ProfileApiResponse;

    if (!response.ok || !data.success || !data.user) {
      throw new Error(data.message ?? "Failed to update profile");
    }

    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      mustChangePassword: Boolean(data.user.mustChangePassword),
    };
  },
};