const backendBaseUrl = String(import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5001").trim().replace(/\/$/, "");

type MediaUrlOptions = {
  defaultUploadPath?: string;
};

export const toAbsoluteMediaUrl = (value?: string, options?: MediaUrlOptions) => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("data:") || normalized.startsWith("blob:")) {
    return normalized;
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      const isLocalUpload =
        ["localhost", "127.0.0.1"].includes(parsed.hostname) && parsed.pathname.startsWith("/uploads/");

      if (isLocalUpload) {
        return `${backendBaseUrl}${parsed.pathname}`;
      }
    } catch {
      // Keep original value if URL parsing fails.
    }

    return normalized;
  }

  if (normalized.startsWith("/")) {
    return `${backendBaseUrl}${normalized}`;
  }

  const defaultUploadPath = options?.defaultUploadPath ?? "/uploads/products";
  return `${backendBaseUrl}${defaultUploadPath}/${normalized}`;
};
