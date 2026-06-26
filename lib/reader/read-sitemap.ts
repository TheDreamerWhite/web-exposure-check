import "server-only";

import * as cheerio from "cheerio";
import {
  MAX_SITEMAP_URLS,
  SITEMAP_MAX_BYTES,
  SITEMAP_TIMEOUT_MS,
} from "./constants";
import { fetchTextLimited } from "./fetch-text-limited";
import { assertPublicUrl } from "./ip-safety";
import type { WebsiteReadResult } from "./types";

type SitemapRead = {
  sitemap: WebsiteReadResult["sitemap"];
  fetchedUrl: string | null;
  errors: string[];
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

async function safeUrl(value: string) {
  try {
    const url = new URL(value.trim());

    await assertPublicUrl(url);

    return url.toString();
  } catch {
    return null;
  }
}

async function extractSitemapUrls(text: string) {
  const $ = cheerio.load(text, { xmlMode: true });
  const urlLocs = $("urlset > url > loc")
    .map((_, element) => $(element).text().trim())
    .get();
  const sitemapIndexLocs = $("sitemapindex > sitemap > loc")
    .map((_, element) => $(element).text().trim())
    .get();
  const sourceLocs = urlLocs.length > 0 ? urlLocs : sitemapIndexLocs;
  const urls: string[] = [];
  const notes: string[] = [];

  for (const loc of sourceLocs) {
    if (urls.length >= MAX_SITEMAP_URLS) {
      notes.push(`Sitemap output was limited to ${MAX_SITEMAP_URLS} URLs.`);
      break;
    }

    const url = await safeUrl(loc);

    if (url && !urls.includes(url)) {
      urls.push(url);
    } else if (!url) {
      notes.push("A sitemap URL was skipped for safety.");
    }
  }

  if (sitemapIndexLocs.length > 0) {
    notes.push(
      "Sitemap index found; nested sitemaps are listed but not crawled in Phase 1."
    );
  }

  return {
    urls,
    notes,
    found: urlLocs.length > 0 || sitemapIndexLocs.length > 0,
  };
}

export async function readSitemap(
  normalizedUrl: string,
  robotsSitemapUrls: string[]
): Promise<SitemapRead> {
  const fallbackSitemapUrl = new URL("/sitemap.xml", normalizedUrl).toString();
  const attemptedUrls = unique([...robotsSitemapUrls, fallbackSitemapUrl]);
  const notes: string[] = [];
  const errors: string[] = [];

  for (const sitemapUrl of attemptedUrls) {
    if (/\.gz(?:$|\?)/i.test(sitemapUrl)) {
      notes.push("Compressed sitemap was detected but not fetched in Phase 1.");
      continue;
    }

    const fetched = await fetchTextLimited(sitemapUrl, {
      maxBytes: SITEMAP_MAX_BYTES,
      timeoutMs: SITEMAP_TIMEOUT_MS,
      accept: "application/xml,text/xml,*/*;q=0.5",
    });

    notes.push(...fetched.notes);
    errors.push(...fetched.errors);

    if (!fetched.ok || !fetched.text) {
      if (fetched.status === 404) {
        notes.push(`${sitemapUrl} was not found.`);
      }

      continue;
    }

    const parsed = await extractSitemapUrls(fetched.text);
    notes.push(...parsed.notes);

    if (parsed.found) {
      return {
        sitemap: {
          attemptedUrls,
          found: true,
          urls: parsed.urls,
          notes,
        },
        fetchedUrl: sitemapUrl,
        errors,
      };
    }

    notes.push(`${sitemapUrl} did not look like a supported sitemap.`);
  }

  if (attemptedUrls.length === 0) {
    notes.push("No sitemap URL was available to try.");
  } else {
    notes.push("No readable sitemap was found.");
  }

  return {
    sitemap: {
      attemptedUrls,
      found: false,
      urls: [],
      notes,
    },
    fetchedUrl: null,
    errors,
  };
}

