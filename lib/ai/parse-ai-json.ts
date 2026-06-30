import "server-only";

import type {
  AiConfidence,
  AiWebsiteUnderstanding,
} from "./types";

const confidenceValues = new Set<AiConfidence>(["low", "medium", "high"]);

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function toConfidence(value: unknown): AiConfidence {
  return confidenceValues.has(value as AiConfidence)
    ? (value as AiConfidence)
    : "low";
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function toTrustSignals(value: unknown): AiWebsiteUnderstanding["trustSignals"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const signal = item as { label?: unknown; evidence?: unknown };

      return {
        label: toStringValue(signal.label),
        evidence: toStringValue(signal.evidence),
      };
    })
    .filter((item) => item.label && item.evidence)
    .slice(0, 8);
}

function toPotentialConcerns(
  value: unknown
): AiWebsiteUnderstanding["potentialConcerns"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const concern = item as {
        label?: unknown;
        businessImpact?: unknown;
        evidence?: unknown;
        suggestedOwner?: unknown;
      };

      return {
        label: toStringValue(concern.label),
        businessImpact: toStringValue(concern.businessImpact),
        evidence: toStringValue(concern.evidence),
        suggestedOwner: toStringValue(concern.suggestedOwner, "Website technician"),
      };
    })
    .filter((item) => item.label && item.businessImpact && item.evidence)
    .slice(0, 8);
}

function extractJsonText(value: string) {
  const trimmedValue = value.trim();
  const fencedMatch = trimmedValue.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmedValue.indexOf("{");
  const lastBrace = trimmedValue.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmedValue.slice(firstBrace, lastBrace + 1);
  }

  return trimmedValue;
}

export function parseAiWebsiteUnderstandingJson(
  value: string,
  model?: string
): AiWebsiteUnderstanding {
  const parsed = JSON.parse(extractJsonText(value)) as Partial<AiWebsiteUnderstanding>;
  const websiteType = parsed.websiteType || {
    label: "unknown",
    confidence: "low",
    reasoning: "The AI response did not include a website type.",
  };
  const evidenceUsed = parsed.evidenceUsed || {
    checks: [],
    homepage: [],
    headers: [],
    robots: [],
    sitemap: [],
    links: [],
  };
  const limitations = toStringArray(parsed.limitations);

  return {
    generatedAt: new Date().toISOString(),
    model,
    websiteType: {
      label: toStringValue(websiteType.label, "unknown"),
      confidence: toConfidence(websiteType.confidence),
      reasoning: toStringValue(
        websiteType.reasoning,
        "Based only on the visible evidence collected in this scan."
      ),
    },
    businessSummary: toStringValue(
      parsed.businessSummary,
      "The AI could not generate a reliable business summary from the observed evidence."
    ),
    trustSignals: toTrustSignals(parsed.trustSignals),
    potentialConcerns: toPotentialConcerns(parsed.potentialConcerns),
    ownerExplanation: toStringValue(
      parsed.ownerExplanation,
      "Review the visible scan results and website reading evidence with your website technician."
    ),
    technicianBrief: toStringValue(
      parsed.technicianBrief,
      "Review the scan checks, homepage metadata, headers, robots.txt, sitemap, and collected links shown in the evidence section."
    ),
    evidenceUsed: {
      checks: toStringArray(evidenceUsed.checks),
      homepage: toStringArray(evidenceUsed.homepage),
      headers: toStringArray(evidenceUsed.headers),
      robots: toStringArray(evidenceUsed.robots),
      sitemap: toStringArray(evidenceUsed.sitemap),
      links: toStringArray(evidenceUsed.links),
    },
    limitations:
      limitations.length > 0
        ? limitations
        : [
            "Only public signals collected during this scan were analyzed.",
            "No login areas, private pages, deep crawling, or vulnerability exploitation were performed.",
            "This is a first-pass understanding and does not replace a professional audit.",
          ],
  };
}

