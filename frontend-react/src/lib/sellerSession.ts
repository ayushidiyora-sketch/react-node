export const SELLER_SESSION_EVENT = "seller-session-updated";

type SellerSessionData = {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  profileImage?: string;
  role?: string;
  mustChangePassword?: boolean;
};

const parseSellerSession = (raw: string | null): SellerSessionData | null => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SellerSessionData;
  } catch {
    return null;
  }
};

export const readSellerSession = (): SellerSessionData | null => {
  return parseSellerSession(localStorage.getItem("sellerUser")) || parseSellerSession(localStorage.getItem("sellerProfile"));
};

export const writeSellerSession = (patch: SellerSessionData) => {
  const current = readSellerSession() || {};
  const next: SellerSessionData = {
    ...current,
    ...patch,
  };

  if (!next.name && next.fullName) {
    next.name = next.fullName;
  }

  if (!next.fullName && next.name) {
    next.fullName = next.name;
  }

  const payload = JSON.stringify(next);
  localStorage.setItem("sellerUser", payload);
  localStorage.setItem("sellerProfile", payload);
  window.dispatchEvent(new CustomEvent(SELLER_SESSION_EVENT, { detail: next }));
  return next;
};

export const clearSellerSession = () => {
  localStorage.removeItem("sellerToken");
  localStorage.removeItem("seller-token");
  localStorage.removeItem("sellerUser");
  localStorage.removeItem("sellerProfile");
  window.dispatchEvent(new CustomEvent(SELLER_SESSION_EVENT, { detail: null }));
};
