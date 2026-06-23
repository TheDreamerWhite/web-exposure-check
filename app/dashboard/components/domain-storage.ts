export type MonitoringFrequency = "manual" | "weekly" | "monthly";

export type MonitoredDomain = {
  id: string;
  name: string;
  frequency: MonitoringFrequency;
  authorizationConfirmed: boolean;
  createdAt: string;
  latestScore: number | null;
  latestRiskLevel: string | null;
  lastScannedAt: string | null;
};

export type NewDomainInput = {
  name: string;
  frequency: MonitoringFrequency;
  authorizationConfirmed: boolean;
};

export const DOMAIN_STORAGE_KEY = "web_exposure_monitored_domains_v1";

const validFrequencies = new Set<MonitoringFrequency>([
  "manual",
  "weekly",
  "monthly",
]);

export function normalizeDomainName(value: string) {
  const rawValue = value.trim();

  if (!rawValue) return "";

  try {
    const urlValue =
      rawValue.startsWith("http://") || rawValue.startsWith("https://")
        ? rawValue
        : `https://${rawValue}`;
    const url = new URL(urlValue);

    return url.hostname.replace(/^www\./i, "").replace(/\.$/, "").toLowerCase();
  } catch {
    return rawValue
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split("?")[0]
      .replace(/\.$/, "")
      .trim()
      .toLowerCase();
  }
}

export function isValidDomainName(domain: string) {
  if (!domain || domain.length > 253 || /\s|\\|@/.test(domain)) return false;

  const labels = domain.split(".");
  const labelRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
  const blockedTlds = new Set(["example", "internal", "invalid", "local", "test"]);
  const topLevelDomain = labels[labels.length - 1];

  return (
    labels.length >= 2 &&
    labels.every((label) => labelRegex.test(label)) &&
    /[a-z]/.test(topLevelDomain) &&
    !blockedTlds.has(topLevelDomain) &&
    domain !== "localhost"
  );
}

export function formatFrequency(frequency: MonitoringFrequency) {
  if (frequency === "weekly") return "Weekly";
  if (frequency === "monthly") return "Monthly";
  return "Manual";
}

export function formatStoredDate(value: string | null) {
  if (!value) return "Not yet";

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "Not yet";
  }
}

export function readStoredDomains(): MonitoredDomain[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(DOMAIN_STORAGE_KEY) || "[]"
    ) as Array<Partial<MonitoredDomain>>;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((domain) => domain.id && domain.name)
      .map((domain) => ({
        id: String(domain.id),
        name: String(domain.name),
        frequency: validFrequencies.has(domain.frequency as MonitoringFrequency)
          ? (domain.frequency as MonitoringFrequency)
          : "manual",
        authorizationConfirmed: Boolean(domain.authorizationConfirmed),
        createdAt: domain.createdAt
          ? String(domain.createdAt)
          : new Date().toISOString(),
        latestScore:
          typeof domain.latestScore === "number" ? domain.latestScore : null,
        latestRiskLevel: domain.latestRiskLevel
          ? String(domain.latestRiskLevel)
          : null,
        lastScannedAt: domain.lastScannedAt ? String(domain.lastScannedAt) : null,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch {
    window.localStorage.removeItem(DOMAIN_STORAGE_KEY);
    return [];
  }
}

export function writeStoredDomains(domains: MonitoredDomain[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(domains));
}

export function buildDomainId(domain: string) {
  return `${domain.replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
}

export function createStoredDomain(input: NewDomainInput) {
  const name = normalizeDomainName(input.name);

  if (!isValidDomainName(name)) {
    throw new Error("Enter a valid public domain, such as example.com.");
  }

  if (!input.authorizationConfirmed) {
    throw new Error("Confirm that you own or are authorized to monitor this domain.");
  }

  const existingDomains = readStoredDomains();

  if (
    existingDomains.some(
      (domain) => domain.name.toLowerCase() === name.toLowerCase()
    )
  ) {
    throw new Error("This domain is already in your monitoring list.");
  }

  const newDomain: MonitoredDomain = {
    id: buildDomainId(name),
    name,
    frequency: input.frequency,
    authorizationConfirmed: input.authorizationConfirmed,
    createdAt: new Date().toISOString(),
    latestScore: null,
    latestRiskLevel: null,
    lastScannedAt: null,
  };

  writeStoredDomains([newDomain, ...existingDomains]);

  return newDomain;
}
