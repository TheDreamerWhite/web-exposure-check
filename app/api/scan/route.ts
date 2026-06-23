import { runExposureScan, ScanInputError } from "@/lib/scan/run-scan";

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

    return Response.json(await runExposureScan(rawDomain));
  } catch (error) {
    if (error instanceof ScanInputError) {
      return jsonError(error.message, error.status);
    }

    console.error("Unexpected scan API failure:", error);

    return jsonError("Unable to complete scan. Please try again later.", 500);
  }
}
