export type CheckTone = "ok" | "warning" | "bad";

export type CheckInfo = {
  label: string;
  description: string;
  fix: string;
};

export const checkOrder = [
  "ssl",
  "httpsRedirect",
  "spf",
  "dmarc",
  "hsts",
  "csp",
  "xFrameOptions",
];

const checkInfoMap: Record<string, CheckInfo> = {
  ssl: {
    label: "SSL certificate",
    description: "Confirms the website can be reached with a valid TLS certificate.",
    fix: "Install or renew a valid TLS certificate and enable HTTPS for the site.",
  },
  httpsRedirect: {
    label: "HTTPS redirect",
    description: "Checks whether HTTP visitors are automatically moved to HTTPS.",
    fix: "Configure a permanent redirect from HTTP to HTTPS at the host or web server.",
  },
  spf: {
    label: "SPF record",
    description: "Looks for sender authorization that helps prevent email spoofing.",
    fix: "Publish an SPF TXT record that includes the services allowed to send mail.",
  },
  dmarc: {
    label: "DMARC record",
    description:
      "Checks whether the domain publishes a policy for failed mail authentication.",
    fix: "Add a DMARC TXT record, start with monitoring, then tighten the policy over time.",
  },
  hsts: {
    label: "HSTS header",
    description: "Reviews whether browsers are told to keep using HTTPS on later visits.",
    fix: "Set the Strict-Transport-Security header after confirming HTTPS is stable everywhere.",
  },
  csp: {
    label: "Content Security Policy",
    description: "Checks for browser rules that limit where scripts and content can load from.",
    fix: "Add a Content-Security-Policy header that reflects the site's trusted sources.",
  },
  xFrameOptions: {
    label: "Frame protection",
    description: "Checks whether the site limits being embedded inside another page.",
    fix: "Use X-Frame-Options or the frame-ancestors CSP directive to reduce clickjacking risk.",
  },
};

export function getCheckTone(value: string): CheckTone {
  const status = value.toLowerCase();

  if (status.includes("ok") || status.includes("pass") || status.includes("valid")) {
    return "ok";
  }

  if (
    status.includes("missing") ||
    status.includes("fail") ||
    status.includes("error") ||
    status.includes("invalid")
  ) {
    return "bad";
  }

  return "warning";
}

export function getCheckInfo(key: string): CheckInfo {
  return (
    checkInfoMap[key] || {
      label: key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (letter) => letter.toUpperCase()),
      description: "This check contributes to the public exposure review.",
      fix: "Review the domain, DNS, or server configuration for this signal.",
    }
  );
}

export function orderedCheckEntries(checks: Record<string, string>) {
  const knownEntries = checkOrder
    .filter((key) => key in checks)
    .map((key) => [key, checks[key]] as [string, string]);
  const unknownEntries = Object.entries(checks).filter(
    ([key]) => !checkOrder.includes(key)
  );

  return [...knownEntries, ...unknownEntries];
}
