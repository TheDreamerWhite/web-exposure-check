import "server-only";

import {
  HOMEPAGE_MAX_BYTES,
  HOMEPAGE_TIMEOUT_MS,
} from "./constants";
import { extractHtmlMetadata } from "./extract-html-metadata";
import type { HtmlMetadata } from "./extract-html-metadata";
import { fetchTextLimited } from "./fetch-text-limited";
import type { WebsiteReadResult } from "./types";

type HomepageRead = {
  homepage: WebsiteReadResult["homepage"];
  notes: string[];
  errors: string[];
};

function emptyMetadata(): HtmlMetadata {
  return {
    title: null,
    metaDescription: null,
    canonicalUrl: null,
    htmlLang: null,
    h1: [],
    internalLinks: [],
    externalLinksSample: [],
  };
}

function isHtmlLike(contentType: string | null) {
  if (!contentType) {
    return true;
  }

  const normalizedContentType = contentType.toLowerCase();

  return (
    normalizedContentType.includes("text/html") ||
    normalizedContentType.includes("application/xhtml+xml")
  );
}

export async function fetchHomepage(normalizedUrl: string): Promise<HomepageRead> {
  const fetched = await fetchTextLimited(normalizedUrl, {
    maxBytes: HOMEPAGE_MAX_BYTES,
    timeoutMs: HOMEPAGE_TIMEOUT_MS,
    accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
  });
  const notes = [...fetched.notes];
  let metadata = emptyMetadata();

  if (fetched.text && isHtmlLike(fetched.contentType)) {
    try {
      metadata = extractHtmlMetadata(fetched.text, fetched.finalUrl);
    } catch (error) {
      notes.push("Homepage HTML metadata could not be extracted.");
      fetched.errors.push(
        error instanceof Error ? error.message : "Homepage metadata parsing failed."
      );
    }
  } else if (fetched.contentType && !isHtmlLike(fetched.contentType)) {
    notes.push(
      "Homepage metadata was limited because the response was not HTML."
    );
  }

  return {
    homepage: {
      requestedUrl: fetched.requestedUrl,
      finalUrl: fetched.finalUrl,
      status: fetched.status,
      ok: fetched.ok,
      contentType: fetched.contentType,
      headers: fetched.headers,
      ...metadata,
    },
    notes,
    errors: fetched.errors,
  };
}
