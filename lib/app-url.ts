const fallbackAppUrl = "https://web-exposure-check.vercel.app";

function normalizeAppUrl(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return fallbackAppUrl;
  }
}

export function getPublicAppUrl() {
  return normalizeAppUrl(
    process.env.NEXT_PUBLIC_APP_URL?.trim() || fallbackAppUrl
  );
}
