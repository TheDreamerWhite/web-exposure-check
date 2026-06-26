import "server-only";

import { ROBOTS_MAX_BYTES, ROBOTS_TIMEOUT_MS } from "./constants";
import { fetchTextLimited } from "./fetch-text-limited";
import { assertPublicUrl } from "./ip-safety";
import type { WebsiteReadResult } from "./types";

type RobotsRead = {
  robots: WebsiteReadResult["robots"];
  errors: string[];
};

async function safeSitemapUrl(value: string, robotsUrl: string) {
  try {
    const url = new URL(value.trim(), robotsUrl);

    await assertPublicUrl(url);

    return url.toString();
  } catch {
    return null;
  }
}

export async function readRobots(normalizedUrl: string): Promise<RobotsRead> {
  const robotsUrl = new URL("/robots.txt", normalizedUrl).toString();
  const fetched = await fetchTextLimited(robotsUrl, {
    maxBytes: ROBOTS_MAX_BYTES,
    timeoutMs: ROBOTS_TIMEOUT_MS,
    accept: "text/plain,*/*;q=0.5",
  });
  const notes = [...fetched.notes];
  const sitemapUrls: string[] = [];
  const found =
    fetched.status !== null && fetched.status >= 200 && fetched.status < 300;

  if (fetched.status === 404) {
    notes.push("robots.txt was not found.");
  } else if (!found) {
    notes.push("robots.txt could not be read as a successful public response.");
  }

  if (found && fetched.text) {
    const sitemapLines = fetched.text
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*sitemap:\s*(.+?)\s*$/i)?.[1])
      .filter((value): value is string => Boolean(value));

    for (const sitemapLine of sitemapLines) {
      const sitemapUrl = await safeSitemapUrl(sitemapLine, robotsUrl);

      if (sitemapUrl && !sitemapUrls.includes(sitemapUrl)) {
        sitemapUrls.push(sitemapUrl);
      } else if (!sitemapUrl) {
        notes.push("A sitemap entry in robots.txt was skipped for safety.");
      }
    }
  }

  return {
    robots: {
      url: robotsUrl,
      status: fetched.status,
      found,
      sitemapUrls,
      notes,
    },
    errors: fetched.errors,
  };
}

