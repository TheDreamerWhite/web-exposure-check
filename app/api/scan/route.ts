import dns from "dns";
import net from "net";
import tls from "tls";
import { domainToASCII } from "url";

export const runtime = "nodejs";

type CheckStatus = "OK" | "Missing" | "Warning";

type SecurityHeadersResult = {
    hsts: CheckStatus;
    csp: CheckStatus;
    xFrameOptions: CheckStatus;
};

const MAX_DOMAIN_LENGTH = 253;
const DNS_TIMEOUT_MS = 4000;
const TLS_TIMEOUT_MS = 5000;
const HTTP_TIMEOUT_MS = 7000;
const HEADER_TIMEOUT_MS = 5000;

const resolver = new dns.promises.Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

function cleanDomain(input: string) {
    const rawValue = input.trim();

    if (!rawValue || rawValue.length > MAX_DOMAIN_LENGTH) {
        return "";
    }

    if (/\s|\\|@/.test(rawValue)) {
        return "";
    }

    const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawValue);

    if (hasProtocol && !/^https?:\/\//i.test(rawValue)) {
        return "";
    }

    try {
        const url = new URL(hasProtocol ? rawValue : `https://${rawValue}`);

        if (url.username || url.password || url.port) {
            return "";
        }

        const hostname = url.hostname
            .replace(/^\[|\]$/g, "")
            .replace(/^www\./i, "")
            .replace(/\.$/, "")
            .toLowerCase();

        if (net.isIP(hostname)) {
            return "";
        }

        return domainToASCII(hostname);
    } catch {
        return "";
    }
}

function isValidDomain(domain: string) {
    if (!domain || domain.length > MAX_DOMAIN_LENGTH) {
        return false;
    }

    const labels = domain.split(".");

    if (labels.length < 2) {
        return false;
    }

    const labelRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
    const topLevelDomain = labels[labels.length - 1];

    return (
        labels.every((label) => labelRegex.test(label)) &&
        /[a-z]/.test(topLevelDomain)
    );
}

function isBlockedDomain(domain: string) {
    const blockedDomains = new Set([
        "localhost",
    ]);
    const blockedTlds = new Set([
        "example",
        "internal",
        "invalid",
        "local",
        "localhost",
        "test",
    ]);
    const labels = domain.split(".");
    const topLevelDomain = labels[labels.length - 1];

    return blockedDomains.has(domain) || blockedTlds.has(topLevelDomain);
}

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

async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    fallback: T
): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
        return await Promise.race([
            promise,
            new Promise<T>((resolve) => {
                timer = setTimeout(() => resolve(fallback), timeoutMs);
            }),
        ]);
    } finally {
        if (timer) {
            clearTimeout(timer);
        }
    }
}

async function getTxtRecords(domain: string) {
    try {
        const records = await withTimeout(
            resolver.resolveTxt(domain),
            DNS_TIMEOUT_MS,
            []
        );

        return records.map((record) => record.join(""));
    } catch (error) {
        console.warn(`DNS TXT lookup failed for ${domain}:`, error);
        return [];
    }
}

async function checkSpf(domain: string): Promise<CheckStatus> {
    const txtRecords = await getTxtRecords(domain);

    const hasSpf = txtRecords.some((record) =>
        record.toLowerCase().startsWith("v=spf1")
    );

    return hasSpf ? "OK" : "Missing";
}

async function checkDmarc(domain: string): Promise<CheckStatus> {
    const txtRecords = await getTxtRecords(`_dmarc.${domain}`);

    const hasDmarc = txtRecords.some((record) =>
        record.toLowerCase().startsWith("v=dmarc1")
    );

    return hasDmarc ? "OK" : "Missing";
}

async function checkSsl(domain: string): Promise<CheckStatus> {
    return new Promise((resolve) => {
        let settled = false;
        const socket = tls.connect(
            {
                host: domain,
                port: 443,
                servername: domain,
                rejectUnauthorized: false,
            },
            () => {
                const certificate = socket.getPeerCertificate();

                if (!certificate || !certificate.valid_to) {
                    finish("Warning");
                    return;
                }

                const validTo = new Date(certificate.valid_to);
                const now = new Date();
                const daysRemaining = Math.floor(
                    (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (!socket.authorized || Number.isNaN(validTo.getTime())) {
                    finish("Warning");
                    return;
                }

                if (daysRemaining <= 14) {
                    finish("Warning");
                    return;
                }

                finish("OK");
            }
        );

        function finish(status: CheckStatus) {
            if (settled) {
                return;
            }

            settled = true;
            socket.destroy();
            resolve(status);
        }

        socket.setTimeout(TLS_TIMEOUT_MS);

        socket.once("timeout", () => finish("Warning"));
        socket.once("error", () => finish("Warning"));
    });
}

async function checkHttpsRedirect(domain: string): Promise<CheckStatus> {
    try {
        const response = await fetch(`http://${domain}`, {
            method: "GET",
            redirect: "follow",
            signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
        });

        const finalUrl = response.url.toLowerCase();

        if (finalUrl.startsWith("https://")) {
            return "OK";
        }

        return "Missing";
    } catch {
        return "Warning";
    }
}

async function checkSecurityHeaders(
    domain: string
): Promise<SecurityHeadersResult> {
    try {
        const response = await fetch(`https://${domain}`, {
            method: "GET",
            redirect: "follow",
            signal: AbortSignal.timeout(HEADER_TIMEOUT_MS),
        });

        const headers = response.headers;

        return {
            hsts: headers.has("strict-transport-security") ? "OK" : "Missing",
            csp: headers.has("content-security-policy") ? "OK" : "Missing",
            xFrameOptions: headers.has("x-frame-options") ? "OK" : "Missing",
        };
    } catch {
        return {
            hsts: "Warning",
            csp: "Warning",
            xFrameOptions: "Warning",
        };
    }
}

function calculateScore(
    spf: CheckStatus,
    dmarc: CheckStatus,
    ssl: CheckStatus,
    httpsRedirect: CheckStatus,
    headers: SecurityHeadersResult
) {
    let score = 100;

    if (ssl === "Warning") score -= 10;
    if (httpsRedirect === "Missing") score -= 10;
    if (httpsRedirect === "Warning") score -= 5;
    if (spf === "Missing") score -= 20;
    if (dmarc === "Missing") score -= 25;

    if (headers.hsts === "Missing") score -= 10;
    if (headers.csp === "Missing") score -= 10;
    if (headers.xFrameOptions === "Missing") score -= 10;

    if (headers.hsts === "Warning") score -= 5;
    if (headers.csp === "Warning") score -= 5;
    if (headers.xFrameOptions === "Warning") score -= 5;

    return Math.max(score, 0);
}

function getRiskLevel(score: number) {
    if (score >= 85) return "Low Risk";
    if (score >= 60) return "Medium Risk";
    return "High Risk";
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

        const domain = cleanDomain(rawDomain);

        if (!isValidDomain(domain) || isBlockedDomain(domain)) {
            return jsonError(
                "Please enter a valid public domain, such as example.com.",
                400
            );
        }

        const [spf, dmarc, ssl, httpsRedirect, headers] = await Promise.all([
            checkSpf(domain),
            checkDmarc(domain),
            checkSsl(domain),
            checkHttpsRedirect(domain),
            checkSecurityHeaders(domain),
        ]);

        const score = calculateScore(spf, dmarc, ssl, httpsRedirect, headers);

        return Response.json({
            domain,
            score,
            riskLevel: getRiskLevel(score),
            checks: {
                ssl,
                httpsRedirect,
                spf,
                dmarc,
                hsts: headers.hsts,
                csp: headers.csp,
                xFrameOptions: headers.xFrameOptions,
            },
        });
    } catch (error) {
        console.error("Unexpected scan API failure:", error);

        return jsonError("Unable to complete scan. Please try again later.", 500);
    }
}
