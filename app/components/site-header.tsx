import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/demo-report", label: "Sample report" },
  { href: "/#pricing", label: "Pricing" },
];

async function getSignedInUserEmail() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.email ?? null;
  } catch {
    return null;
  }
}

export async function SiteHeader() {
  const userEmail = await getSignedInUserEmail();
  const userInitial = userEmail?.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-[#111827] text-[#F9FAFB]">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold text-white">
          <span className="grid size-8 place-items-center rounded-md bg-[#0F766E] text-xs font-black text-white">
            WE
          </span>
          <span className="text-sm sm:text-base">Web Exposure Check</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <details className="site-avatar-menu relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
            Menu
          </summary>
          <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-slate-950 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>

        <nav
          aria-label="Account navigation"
          className="order-3 flex w-full items-center justify-between gap-2 sm:gap-3 md:order-none md:w-auto md:justify-end"
        >
          {userEmail ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59] focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-[#111827] sm:px-4"
              >
                Dashboard
              </Link>
              <details className="site-avatar-menu relative">
                <summary
                  aria-label="Open account menu"
                  className="grid size-9 cursor-pointer list-none place-items-center rounded-full border border-white/15 bg-white/10 text-sm font-bold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-[#111827]"
                >
                  {userInitial}
                </summary>
                <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-slate-950 shadow-lg">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <form action="/logout" method="post">
                    <button
                      type="submit"
                      className="block w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </details>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-200 transition hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59] focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-[#111827] sm:px-4"
              >
                Dashboard
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
