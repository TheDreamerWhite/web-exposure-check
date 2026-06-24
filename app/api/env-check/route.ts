export const runtime = "nodejs";

function hasEnv(name: string) {
  return Boolean(process.env[name]);
}

export async function GET() {
  return Response.json(
    {
      appUrl: hasEnv("NEXT_PUBLIC_APP_URL"),
      supabaseUrl: hasEnv("NEXT_PUBLIC_SUPABASE_URL"),
      supabasePublishableKey: hasEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      supabaseSecretKey: hasEnv("SUPABASE_SECRET_KEY"),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
