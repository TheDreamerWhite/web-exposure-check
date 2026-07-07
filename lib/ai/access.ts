import "server-only";

export type AiAccessReason =
  | "disabled"
  | "internal_allowed"
  | "not_internal_tester"
  | "public_allowed"
  | "public_disabled_in_production"
  | "unknown_mode";

type AiAccessInput = {
  userEmail?: string | null;
};

export type AiAccessDecision = {
  allowed: boolean;
  reason: AiAccessReason;
};

function getAiAccessMode() {
  return (process.env.AI_ACCESS_MODE || "").trim().toLowerCase();
}

function getTesterEmails() {
  return (process.env.AI_TESTER_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function canUseAiWebsiteUnderstanding({
  userEmail,
}: AiAccessInput): AiAccessDecision {
  if (process.env.ENABLE_AI_WEBSITE_UNDERSTANDING !== "true") {
    return {
      allowed: false,
      reason: "disabled",
    };
  }

  const accessMode = getAiAccessMode();

  if (accessMode === "internal") {
    const normalizedEmail = userEmail?.trim().toLowerCase();
    const testerEmails = getTesterEmails();
    const isTester = Boolean(
      normalizedEmail && testerEmails.includes(normalizedEmail)
    );

    return isTester
      ? {
          allowed: true,
          reason: "internal_allowed",
        }
      : {
          allowed: false,
          reason: "not_internal_tester",
        };
  }

  if (accessMode === "public") {
    const allowPublicInProduction =
      process.env.AI_ALLOW_PUBLIC_IN_PRODUCTION === "true";

    if (process.env.NODE_ENV === "production" && !allowPublicInProduction) {
      return {
        allowed: false,
        reason: "public_disabled_in_production",
      };
    }

    return {
      allowed: true,
      reason: "public_allowed",
    };
  }

  return {
    allowed: false,
    reason: "unknown_mode",
  };
}
