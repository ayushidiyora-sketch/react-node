import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { getActiveRoleFromPath, getLegacyProfileKey, getLegacyTokenKey, getProfileKey, getTokenKey, type UserRole } from "../../lib/authStorage.ts";

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  mustChangePassword?: boolean;
};

type AuthState = {
  token: string | null;
  admin: AdminProfile | null;
  panelRole: UserRole | null;
};

const parseProfile = (raw: string | null): AdminProfile | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AdminProfile>;

    if (parsed.id && parsed.name && parsed.email) {
      return {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        role: parsed.role === "seller" ? "seller" : "admin",
        mustChangePassword: Boolean(parsed.mustChangePassword),
      };
    }
  } catch {
    return null;
  }

  return null;
};

const readStateForRole = (role: UserRole): AuthState => {
  const tokenKey = getTokenKey(role);
  const profileKey = getProfileKey(role);

  const token = localStorage.getItem(tokenKey) ?? localStorage.getItem(getLegacyTokenKey(role));
  const profile = localStorage.getItem(profileKey) ?? localStorage.getItem(getLegacyProfileKey(role));
  const parsedProfile = parseProfile(profile);

  if (!token || !parsedProfile || parsedProfile.role !== role) {
    return {
      token: null,
      admin: null,
      panelRole: null,
    };
  }

  return {
    token,
    admin: parsedProfile,
    panelRole: role,
  };
};

const getInitialState = (): AuthState => {
  const preferredRole = getActiveRoleFromPath();
  const preferredState = readStateForRole(preferredRole);

  if (preferredState.token && preferredState.admin) {
    return preferredState;
  }

  const fallbackRole: UserRole = preferredRole === "admin" ? "seller" : "admin";
  const fallbackState = readStateForRole(fallbackRole);

  return {
    token: fallbackState.token,
    admin: fallbackState.admin,
    panelRole: fallbackState.panelRole,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; admin: AdminProfile }>) => {
      const role = action.payload.admin.role === "seller" ? "seller" : "admin";
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      state.panelRole = role;

      localStorage.setItem(getTokenKey(role), action.payload.token);
      localStorage.setItem(getProfileKey(role), JSON.stringify(action.payload.admin));

      localStorage.setItem(getLegacyTokenKey(role), action.payload.token);
      localStorage.setItem(getLegacyProfileKey(role), JSON.stringify(action.payload.admin));
    },
    updateAdminProfile: (state, action: PayloadAction<Partial<AdminProfile>>) => {
      if (!state.admin) {
        return;
      }

      state.admin = {
        ...state.admin,
        ...action.payload,
      };

      const role = state.panelRole ?? (state.admin.role === "seller" ? "seller" : "admin");
      localStorage.setItem(getProfileKey(role), JSON.stringify(state.admin));

      localStorage.setItem(getLegacyProfileKey(role), JSON.stringify(state.admin));
    },
    logout: (state, action: PayloadAction<UserRole | undefined>) => {
      const role = action.payload ?? state.panelRole ?? (state.admin?.role === "seller" ? "seller" : "admin");

      if (state.panelRole === role || state.admin?.role === role) {
        state.token = null;
        state.admin = null;
        state.panelRole = null;
      }

      localStorage.removeItem(getTokenKey(role));
      localStorage.removeItem(getProfileKey(role));
      localStorage.removeItem(getLegacyTokenKey(role));
      localStorage.removeItem(getLegacyProfileKey(role));
    },
  },
});

export const { setCredentials, updateAdminProfile, logout } = authSlice.actions;
export default authSlice.reducer;