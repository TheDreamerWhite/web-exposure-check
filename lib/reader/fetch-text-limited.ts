import "server-only";

import {
  MAX_REDIRECTS,
  READER_USER_AGENT,
  SAFE_RESPONSE_HEADER_ALLOWLIST,
} from "./constants";
import { assertPublicUrl } from "./ip-safety";

export type FetchTextLimitedResult = {
  requestedUrl: string;
  finalUrl: string;
  status: number | null;
  ok: boolean;
  contentType: string | null;
  headers: Record<string, string>;
  text: string;
  notes: string[];
  errors: string[];
};

type FetchTextLimitedOptions = {
  maxBytes: number;
  timeoutMs: number;
  accept: string;
};

function selectedHeaders(headers: Headers) {
  const safeHeaders: Record<string, string> = {};

  SAFE_RESPONSE_HEADER_ALLOWLIST.forEach((headerName) => {
    const value = headers.get(headerName);

    if (value) {
      safeHeaders[headerName] = value;
    }
  });

  return safeHeaders;
}

async function readBodyWithLimit(response: Response, maxBytes: number) {
  const notes: string[] = [];

  if (!response.body) {
    return { text: "", notes };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytesRead = 0;
  let truncated = false;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const remainingBytes = maxBytes - bytesRead;

      if (remainingBytes <= 0) {
        truncated = true;
        await reader.cancel();
        break;
      }

      const chunk =
        value.byteLength > remainingBytes
          ? value.slice(0, remainingBytes)
          : value;

      bytesRead += chunk.byteLength;
      text += decoder.decode(chunk, { stream: true });

      if (value.byteLength > remainingBytes) {
        truncated = true;
        await reader.cancel();
        break;
      }
    }
  } finally {
    text += decoder.decode();
  }

  if (truncated) {
    notes.push(`Response body was limited to ${maxBytes} bytes.`);
  }

  return { text, notes };
}

function resolveRedirectUrl(location: string, currentUrl: URL) {
  const redirectUrl = new URL(location, currentUrl);

  if (redirectUrl.protocol !== "http:" && redirectUrl.protocol !== "https:") {
    throw new Error("Redirect target was not HTTP or HTTPS.");
  }

  if (redirectUrl.username || redirectUrl.password) {
    throw new Error("Redirect target included username or password.");
  }

  if (redirectUrl.port && redirectUrl.port !== "80" && redirectUrl.port !== "443") {
    throw new Error("Redirect target used a custom port.");
  }

  return redirectUrl;
}

export async function fetchTextLimited(
  url: string,
  options: FetchTextLimitedOptions
): Promise<FetchTextLimitedResult> {
  const requestedUrl = url;
  let currentUrl = new URL(url);
  const notes: string[] = [];
  const errors: string[] = [];

  try {
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      await assertPublicUrl(currentUrl);

      const response = await fetch(currentUrl, {
        redirect: "manual",
        signal: AbortSignal.timeout(options.timeoutMs),
        headers: {
          accept: options.accept,
          "user-agent": READER_USER_AGENT,
        },
      });
      const headers = selectedHeaders(response.headers);
      const contentType = response.headers.get("content-type");
      const location = response.headers.get("location");

      if (
        response.status >= 300 &&
        response.status < 400 &&
        location
      ) {
        if (redirectCount === MAX_REDIRECTS) {
          notes.push("Redirect limit reached before reading the final page.");

          return {
            requestedUrl,
            finalUrl: currentUrl.toString(),
            status: response.status,
            ok: false,
            contentType,
            headers,
            text: "",
            notes,
            errors,
          };
        }

        const redirectUrl = resolveRedirectUrl(location, currentUrl);
        await assertPublicUrl(redirectUrl);
        notes.push(`Redirected to ${redirectUrl.toString()}`);
        currentUrl = redirectUrl;
        continue;
      }

      const body = await readBodyWithLimit(response, options.maxBytes);

      return {
        requestedUrl,
        finalUrl: currentUrl.toString(),
        status: response.status,
        ok: response.ok,
        contentType,
        headers,
        text: body.text,
        notes: [...notes, ...body.notes],
        errors,
      };
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Website fetch failed.");
  }

  return {
    requestedUrl,
    finalUrl: currentUrl.toString(),
    status: null,
    ok: false,
    contentType: null,
    headers: {},
    text: "",
    notes,
    errors,
  };
}

