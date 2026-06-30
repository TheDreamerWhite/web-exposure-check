import "server-only";

import type { ReportScanResult } from "@/lib/report/types";

type AiWebsiteUnderstandingInput = {
  scanResult: ReportScanResult;
};

function truncateList(values: string[] = [], limit = 20) {
  return values.slice(0, limit);
}

function buildObservedData(input: AiWebsiteUnderstandingInput) {
  const { scanResult } = input;
  const websiteReadResult = scanResult.websiteReadResult;
  const homepage = websiteReadResult?.homepage;

  return {
    domain: scanResult.domain,
    score: scanResult.score,
    riskLevel: scanResult.riskLevel,
    checks: scanResult.checks,
    homepage: homepage
      ? {
          finalUrl: homepage.finalUrl,
          status: homepage.status,
          contentType: homepage.contentType,
          title: homepage.title,
          metaDescription: homepage.metaDescription,
          canonicalUrl: homepage.canonicalUrl,
          htmlLang: homepage.htmlLang,
          h1: homepage.h1,
        }
      : null,
    headers: homepage?.headers || {},
    robots: websiteReadResult
      ? {
          found: websiteReadResult.robots.found,
          status: websiteReadResult.robots.status,
          sitemapUrls: truncateList(websiteReadResult.robots.sitemapUrls, 10),
          notes: websiteReadResult.robots.notes,
        }
      : null,
    sitemap: websiteReadResult
      ? {
          found: websiteReadResult.sitemap.found,
          attemptedUrls: truncateList(websiteReadResult.sitemap.attemptedUrls, 10),
          urls: truncateList(websiteReadResult.sitemap.urls, 30),
          notes: websiteReadResult.sitemap.notes,
        }
      : null,
    links: homepage
      ? {
          internalLinks: truncateList(homepage.internalLinks, 20),
          externalLinksSample: truncateList(homepage.externalLinksSample, 10),
        }
      : null,
    evidence: websiteReadResult
      ? {
          pagesRead: websiteReadResult.evidence.pagesRead,
          pagesDiscovered: truncateList(
            websiteReadResult.evidence.pagesDiscovered,
            30
          ),
          notes: websiteReadResult.evidence.notes,
          errors: websiteReadResult.errors,
        }
      : null,
  };
}

export function buildWebsiteUnderstandingPrompt(
  input: AiWebsiteUnderstandingInput
) {
  const observedData = buildObservedData(input);

  return [
    "You generate evidence-based website trust and security report sections for small business owners.",
    "Use only the structured observed data below. Do not claim you read pages that are not listed in pagesRead.",
    "Do not say the full website was crawled. Do not infer unavailable pages. Do not claim vulnerabilities unless supported by scan checks.",
    "Use clear business language. Mention limitations plainly. Return valid JSON only.",
    "The JSON must match this schema exactly:",
    JSON.stringify(
      {
        websiteType: {
          label: "restaurant | ecommerce | local business | SaaS | portfolio | blog/media | agency | unknown",
          confidence: "low | medium | high",
          reasoning: "string grounded in observed title, description, H1, or links",
        },
        businessSummary: "string",
        trustSignals: [{ label: "string", evidence: "string" }],
        potentialConcerns: [
          {
            label: "string",
            businessImpact: "string",
            evidence: "string",
            suggestedOwner: "string",
          },
        ],
        ownerExplanation: "string",
        technicianBrief: "string",
        evidenceUsed: {
          checks: ["string"],
          homepage: ["string"],
          headers: ["string"],
          robots: ["string"],
          sitemap: ["string"],
          links: ["string"],
        },
        limitations: ["string"],
      },
      null,
      2
    ),
    "Observed data:",
    JSON.stringify(observedData, null, 2),
  ].join("\n\n");
}
