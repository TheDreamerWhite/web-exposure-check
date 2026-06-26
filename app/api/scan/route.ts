import { runExposureScan, ScanInputError } from "@/lib/scan/run-scan";
import { readWebsite } from "@/lib/reader/read-website";
import type { WebsiteReadResult } from "@/lib/reader/types";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function createSafeReaderErrorResult(
  input: string,
  error: unknown
): WebsiteReadResult {
  const message =
    error instanceof Error ? error.message : "Website reading failed.";

  return {
    domain: input.trim(),
    normalizedUrl: "",
    fetchedAt: new Date().toISOString(),
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
      notes: ["Website reading failed, but the core scan completed."],
    },
    errors: [message],
  };
}

export async function GET() {
  return Response.json(
    {
      error:
        'Use POST /api/scan with a JSON body like { "domain": "example.com" }.',
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonError("Request body must be a valid JSON object.", 400);
    }

    const rawDomain = (body as { domain?: unknown }).domain;

    if (!rawDomain || typeof rawDomain !== "string") {
      return jsonError("Domain is required.", 400);
    }

    const scanResult = await runExposureScan(rawDomain);
    let websiteReadResult: WebsiteReadResult;

    try {
      websiteReadResult = await readWebsite(rawDomain);
    } catch (error) {
      websiteReadResult = createSafeReaderErrorResult(rawDomain, error);
    }

    return Response.json({
      ...scanResult,
      websiteReadResult,
    });
  } catch (error) {
    if (error instanceof ScanInputError) {
      return jsonError(error.message, error.status);
    }

    console.error("Unexpected scan API failure:", error);

    return jsonError("Unable to complete scan. Please try again later.", 500);
  }
}
