export type UserRole = "admin" | "seller";

const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_PROFILE_KEY = "adminProfile";
const SELLER_TOKEN_KEY = "sellerToken";
const SELLER_PROFILE_KEY = "sellerProfile";

const normalizePath = (path: string): string => path.toLowerCase();

export const getActiveRoleFromPath = (path = window.location.pathname): UserRole => {
  const normalized = normalizePath(path);
  return normalized.startsWith("/seller") ? "seller" : "admin";
};

export const getTokenKey = (role: UserRole): string => (role === "seller" ? SELLER_TOKEN_KEY : ADMIN_TOKEN_KEY);

export const getProfileKey = (role: UserRole): string => (role === "seller" ? SELLER_PROFILE_KEY : ADMIN_PROFILE_KEY);

export const getLegacyTokenKey = (role: UserRole): string => (role === "seller" ? "seller-token" : "admin-token");

export const getLegacyProfileKey = (role: UserRole): string => (role === "seller" ? "seller-profile" : "admin-profile");
