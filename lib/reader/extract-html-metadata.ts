import "server-only";

import * as cheerio from "cheerio";
import { MAX_EXTERNAL_LINKS, MAX_INTERNAL_LINKS } from "./constants";

export type HtmlMetadata = {
  title: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  htmlLang: string | null;
  h1: string[];
  internalLinks: string[];
  externalLinksSample: string[];
};

function cleanText(value: string | undefined) {
  const cleanedValue = value?.replace(/\s+/g, " ").trim();

  return cleanedValue || null;
}

function uniquePush(values: string[], value: string, limit: number) {
  if (values.length >= limit || values.includes(value)) {
    return;
  }

  values.push(value);
}

function resolveHttpUrl(href: string, baseUrl: string) {
  const trimmedHref = href.trim();

  if (
    !trimmedHref ||
    /^(?:mailto|tel|javascript|data):/i.test(trimmedHref)
  ) {
    return null;
  }

  try {
    const url = new URL(trimmedHref, baseUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.hash = "";

    return url;
  } catch {
    return null;
  }
}

export function extractHtmlMetadata(html: string, finalHomepageUrl: string): HtmlMetadata {
  const $ = cheerio.load(html);
  const baseUrl = finalHomepageUrl;
  const baseHostname = new URL(baseUrl).hostname.toLowerCase();
  const h1: string[] = [];
  const internalLinks: string[] = [];
  const externalLinksSample: string[] = [];
  const canonicalHref = $('link[rel~="canonical"]').first().attr("href");
  const canonicalUrl = canonicalHref
    ? resolveHttpUrl(canonicalHref, baseUrl)?.toString() || null
    : null;

  $("h1").each((_, element) => {
    const text = cleanText($(element).text());

    if (text && !h1.includes(text)) {
      h1.push(text);
    }
  });

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    const url = href ? resolveHttpUrl(href, baseUrl) : null;

    if (!url) {
      return;
    }

    if (url.hostname.toLowerCase() === baseHostname) {
      uniquePush(internalLinks, url.toString(), MAX_INTERNAL_LINKS);
      return;
    }

    uniquePush(externalLinksSample, url.toString(), MAX_EXTERNAL_LINKS);
  });

  return {
    title: cleanText($("title").first().text()),
    metaDescription: cleanText(
      $('meta[name="description" i]').first().attr("content")
    ),
    canonicalUrl,
    htmlLang: cleanText($("html").first().attr("lang")),
    h1,
    internalLinks,
    externalLinksSample,
  };
}

