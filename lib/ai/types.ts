export type AiConfidence = "low" | "medium" | "high";

export type AiWebsiteUnderstanding = {
  generatedAt: string;
  model?: string;
  websiteType: {
    label: string;
    confidence: AiConfidence;
    reasoning: string;
  };
  businessSummary: string;
  trustSignals: Array<{
    label: string;
    evidence: string;
  }>;
  potentialConcerns: Array<{
    label: string;
    businessImpact: string;
    evidence: string;
    suggestedOwner: string;
  }>;
  ownerExplanation: string;
  technicianBrief: string;
  evidenceUsed: {
    checks: string[];
    homepage: string[];
    headers: string[];
    robots: string[];
    sitemap: string[];
    links: string[];
  };
  limitations: string[];
};
