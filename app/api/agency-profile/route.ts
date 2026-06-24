import { NextResponse } from "next/server";
import {
  getAgencyProfile,
  upsertAgencyProfile,
} from "@/lib/scans/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET() {
  const user = await getUser();

  if (!user) {
    return jsonError("Authentication is required.", 401);
  }

  return NextResponse.json({
    profile: await getAgencyProfile(user.id),
  });
}

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return jsonError("Authentication is required.", 401);
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return jsonError("Profile values are required.", 400);
  }

  const profile = await upsertAgencyProfile(user.id, {
    agency_name: cleanText(body.agencyName),
    agency_email: cleanText(body.agencyEmail),
    agency_website: cleanText(body.agencyWebsite),
    logo_url: cleanText(body.logoUrl),
  });

  return NextResponse.json({ profile });
}
