import "server-only";

import { fetchHomepage } from "./fetch-homepage";
import { assertPublicUrl } from "./ip-safety";
import { normalizeWebsiteUrl } from "./normalize-url";
import { readRobots } from "./read-robots";
import { readSitemap } from "./read-sitemap";
import type { WebsiteReadResult } from "./types";

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function emptyReadResult(input: string, error: string): WebsiteReadResult {
  const fetchedAt = new Date().toISOString();

  return {
    domain: input.trim(),
    normalizedUrl: "",
    fetchedAt,
    homepage: {
      requestedUrl: input,
      finalUrl: "",
      status: null,
      ok: false,
      contentType: null,
      headers: {},
      title: null,
      metaDescription: null,
      canonicalUrl: null,
      htmlLang: null,
      h1: [],
      internalLinks: [],
      externalLinksSample: [],
    },
    robots: {
      url: "",
      status: null,
      found: false,
      sitemapUrls: [],
      notes: [],
    },
    sitemap: {
      attemptedUrls: [],
      found: false,
      urls: [],
      notes: [],
    },
    evidence: {
      pagesRead: [],
      pagesDiscovered: [],
      notes: ["Website reading did not run because the target was blocked."],
    },
    errors: [error],
  };
}

export async function readWebsite(input: string): Promise<WebsiteReadResult> {
  const fetchedAt = new Date().toISOString();
  let normalizedUrl: URL;

  try {
    normalizedUrl = normalizeWebsiteUrl(input);
    await assertPublicUrl(normalizedUrl);
  } catch (error) {
    return emptyReadResult(
      input,
      error instanceof Error ? error.message : "Website target could not be read."
    );
  }

  const homepageRead = await fetchHomepage(normalizedUrl.toString());
  const robotsRead = await readRobots(normalizedUrl.toString());
  const sitemapRead = await readSitemap(
    normalizedUrl.toString(),
    robotsRead.robots.sitemapUrls
  );
  const notes = [
    ...homepageRead.notes,
    ...robotsRead.robots.notes,
    ...sitemapRead.sitemap.notes,
  ];

  if (!robotsRead.robots.found) {
    notes.push("robots.txt was missing or unavailable.");
  }

  if (!sitemapRead.sitemap.found) {
    notes.push("No sitemap was found during this Phase 1 read.");
  }

  if (
    sitemapRead.sitemap.found &&
    sitemapRead.sitemap.notes.some((note) => note.includes("Sitemap index found"))
  ) {
    notes.push("Nested sitemap crawling is not performed in Phase 1.");
  }

  return {
    domain: normalizedUrl.hostname.replace(/^www\./i, ""),
    normalizedUrl: normalizedUrl.toString(),
    fetchedAt,
    homepage: homepageRead.homepage,
    robots: robotsRead.robots,
    sitemap: sitemapRead.sitemap,
    evidence: {
      pagesRead: unique([
        homepageRead.homepage.finalUrl || homepageRead.homepage.requestedUrl,
        robotsRead.robots.url,
        sitemapRead.fetchedUrl,
      ]),
      pagesDiscovered: unique([
        ...homepageRead.homepage.internalLinks,
        ...sitemapRead.sitemap.urls,
      ]),
      notes: unique(notes),
    },
    errors: unique([
      ...homepageRead.errors,
      ...robotsRead.errors,
      ...sitemapRead.errors,
    ]),
  };
}

