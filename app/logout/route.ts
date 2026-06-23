import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/login?loggedOut=true", request.url));
}

export async function POST(request: NextRequest) {
  return GET(request);
}
