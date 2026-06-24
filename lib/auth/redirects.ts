import { getPublicAppUrl } from "@/lib/app-url";

export function getSafeRedirectPath(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export function getAbsoluteAppUrl(path = "/", fallbackOrigin?: string) {
  return new URL(getSafeRedirectPath(path), getPublicAppUrl(fallbackOrigin));
}

export function getAuthCallbackUrl(next = "/dashboard", fallbackOrigin?: string) {
  const callbackUrl = new URL("/auth/callback", getPublicAppUrl(fallbackOrigin));

  callbackUrl.searchParams.set("next", getSafeRedirectPath(next));

  return callbackUrl.toString();
}
