import { NextResponse, type NextRequest } from "next/server";
import type { FindingWorkflowStatus } from "@/lib/scans/types";
import {
  getScanReportById,
  updateFindingStatuses,
} from "@/lib/scans/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const validStatuses = new Set<FindingWorkflowStatus>([
  "open",
  "in_progress",
  "fixed",
  "ignored",
]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error || !user ? null : user;
}

export async function GET(_request: NextRequest, { params }: RouteProps) {
  const user = await getUser();

  if (!user) {
    return jsonError("Authentication is required.", 401);
  }

  const { id } = await params;
  const report = await getScanReportById(user.id, id);

  if (!report) {
    return jsonError("Report not found.", 404);
  }

  return NextResponse.json({ report });
}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  const user = await getUser();

  if (!user) {
    return jsonError("Authentication is required.", 401);
  }

  const body = (await request.json().catch(() => null)) as {
    findingStatuses?: Record<string, string>;
  } | null;
  const findingStatuses = body?.findingStatuses;

  if (!findingStatuses || typeof findingStatuses !== "object") {
    return jsonError("Finding statuses are required.", 400);
  }

  const cleanStatuses = Object.fromEntries(
    Object.entries(findingStatuses).filter(([, value]) =>
      validStatuses.has(value as FindingWorkflowStatus)
    )
  ) as Record<string, FindingWorkflowStatus>;
  const { id } = await params;
  const report = await updateFindingStatuses(user.id, id, cleanStatuses);

  return NextResponse.json({ report });
}
