import type { Metadata } from "next";
import { DemoPageClient } from "./demo-page-client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Free Website Exposure Check",
  description:
    "Run a customer-friendly website exposure check for security headers, DNS exposure, HTTPS status, and public website evidence.",
};

export const dynamic = "force-dynamic";

function getTesterEmails() {
  return (process.env.AI_TESTER_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function getDemoAuthState() {
  if (!isSupabaseConfigured()) {
    return {
      canShowAiInsights: false,
      isSignedIn: false,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userEmail = user?.email || null;
    const normalizedUserEmail = userEmail?.toLowerCase() || null;
    const testerEmails = getTesterEmails();
    const isApprovedTester = normalizedUserEmail
      ? testerEmails.includes(normalizedUserEmail)
      : false;

    return {
      canShowAiInsights: isApprovedTester,
      isSignedIn: Boolean(userEmail),
    };
  } catch {
    return {
      canShowAiInsights: false,
      isSignedIn: false,
    };
  }
}

export default async function DemoPage() {
  const authState = await getDemoAuthState();

  return <DemoPageClient {...authState} />;
}
