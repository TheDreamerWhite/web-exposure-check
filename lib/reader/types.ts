export type WebsiteReadResult = {
  domain: string;
  normalizedUrl: string;
  fetchedAt: string;
  homepage: {
    requestedUrl: string;
    finalUrl: string;
    status: number | null;
    ok: boolean;
    contentType: string | null;
    headers: Record<string, string>;
    title: string | null;
    metaDescription: string | null;
    canonicalUrl: string | null;
    htmlLang: string | null;
    h1: string[];
    internalLinks: string[];
    externalLinksSample: string[];
  };
  robots: {
    url: string;
    status: number | null;
    found: boolean;
    sitemapUrls: string[];
    notes: string[];
  };
  sitemap: {
    attemptedUrls: string[];
    found: boolean;
    urls: string[];
    notes: string[];
  };
  evidence: {
    pagesRead: string[];
    pagesDiscovered: string[];
    notes: string[];
  };
  errors: string[];
};

