import "server-only";

export function normalizeWebsiteUrl(input: string) {
  const rawValue = input.trim();

  if (!rawValue) {
    throw new Error("Enter a website domain or URL to read.");
  }

  const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawValue);
  const url = new URL(hasProtocol ? rawValue : `https://${rawValue}`);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs can be read.");
  }

  if (url.username || url.password) {
    throw new Error("URLs with usernames or passwords cannot be read.");
  }

  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new Error("Custom ports are not supported for website reading.");
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";

  return url;
}

