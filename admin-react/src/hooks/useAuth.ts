import { useSelector } from "react-redux";

import { getActiveRoleFromPath, getLegacyProfileKey, getLegacyTokenKey, getProfileKey, getTokenKey, type UserRole } from "../lib/authStorage.ts";
import type { RootState } from "../store/index.ts";

type AuthProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  mustChangePassword?: boolean;
};

const parseProfile = (raw: string | null): AuthProfile | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthProfile>;

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

const readStoredSession = (role: UserRole) => {
  const token = localStorage.getItem(getTokenKey(role)) || localStorage.getItem(getLegacyTokenKey(role));
  const profileRaw = localStorage.getItem(getProfileKey(role)) || localStorage.getItem(getLegacyProfileKey(role));
  const profile = parseProfile(profileRaw);

  if (!token || !profile || profile.role !== role) {
    return null;
  }

  return {
    token,
    profile,
  };
};

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const activeRole = getActiveRoleFromPath();
  const storedSession = readStoredSession(activeRole);
  const resolvedToken = storedSession?.token ?? auth.token;
  const resolvedAdmin = storedSession?.profile ?? auth.admin;

  return {
    isAuthenticated: Boolean(resolvedToken && resolvedAdmin),
    token: resolvedToken,
    admin: resolvedAdmin,
    role: resolvedAdmin?.role,
    mustChangePassword: Boolean(resolvedAdmin?.mustChangePassword),
  };
};