import dns from "dns";
import tls from "tls";

export const runtime = "nodejs";

type CheckStatus = "OK" | "Missing" | "Warning";

type SecurityHeadersResult = {
    hsts: CheckStatus;
    csp: CheckStatus;
    xFrameOptions: CheckStatus;
};

const resolver = new dns.promises.Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

function cleanDomain(input: string) {
    return input
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .toLowerCase();
}

function isValidDomain(domain: string) {
    const domainRegex =
        /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

    return domainRegex.test(domain);
}

function isBlockedDomain(domain: string) {
    const blockedDomains = [
        "localhost",
        "local",
        "internal",
    ];

    return blockedDomains.includes(domain);
}

async function getTxtRecords(domain: string) {
    try {
        const records = await resolver.resolveTxt(domain);
        return records.map((record) => record.join(""));
    } catch (error) {
        console.error(`DNS TXT lookup failed for ${domain}:`, error);
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
        const socket = tls.connect(
            {
                host: domain,
                port: 443,
                servername: domain,
                rejectUnauthorized: false,
                timeout: 5000,
            },
            () => {
                const certificate = socket.getPeerCertificate();

                if (!certificate || !certificate.valid_to) {
                    socket.end();
                    resolve("Warning");
                    return;
                }

                const validTo = new Date(certificate.valid_to);
                const now = new Date();
                const daysRemaining = Math.floor(
                    (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                socket.end();

                if (!socket.authorized) {
                    resolve("Warning");
                    return;
                }

                if (daysRemaining <= 14) {
                    resolve("Warning");
                    return;
                }

                resolve("OK");
            }
        );

        socket.on("timeout", () => {
            socket.destroy();
            resolve("Warning");
        });

        socket.on("error", () => {
            resolve("Warning");
        });
    });
}

async function checkHttpsRedirect(domain: string): Promise<CheckStatus> {
    try {
        const response = await fetch(`http://${domain}`, {
            method: "GET",
            redirect: "follow",
            signal: AbortSignal.timeout(7000),
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
            signal: AbortSignal.timeout(5000),
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

export async function POST(req: Request) {
    const body = await req.json();
    const rawDomain = body.domain;

    if (!rawDomain || typeof rawDomain !== "string") {
        return Response.json(
            { error: "Domain is required" },
            { status: 400 }
        );
    }

    const domain = cleanDomain(rawDomain);
    if (!isValidDomain(domain) || isBlockedDomain(domain)) {
        return Response.json(
            {
                error:
                    "Please enter a valid public domain, such as example.com.",
            },
            { status: 400 }
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
}