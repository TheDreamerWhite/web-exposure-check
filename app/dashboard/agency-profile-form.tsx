"use client";

import { useState } from "react";
import type { AgencyProfile } from "@/lib/types/database";

type AgencyProfileFormProps = {
  profile: AgencyProfile | null;
};

export function AgencyProfileForm({ profile }: AgencyProfileFormProps) {
  const [agencyName, setAgencyName] = useState(profile?.agency_name || "");
  const [agencyEmail, setAgencyEmail] = useState(profile?.agency_email || "");
  const [agencyWebsite, setAgencyWebsite] = useState(
    profile?.agency_website || ""
  );
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url || "");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    setSaving(true);
    setStatus("Saving agency profile...");

    try {
      const response = await fetch("/api/agency-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agencyName,
          agencyEmail,
          agencyWebsite,
          logoUrl,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Profile could not be saved.");
      }

      setStatus("Agency profile saved.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Profile could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Agency profile</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        These details can appear on downloaded client PDFs. This is a lightweight
        foundation for future white-label reporting.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="text-sm font-semibold text-slate-950">
          Agency name
          <input
            value={agencyName}
            onChange={(event) => setAgencyName(event.target.value)}
            placeholder="Your agency"
            className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="text-sm font-semibold text-slate-950">
          Contact email
          <input
            type="email"
            value={agencyEmail}
            onChange={(event) => setAgencyEmail(event.target.value)}
            placeholder="hello@example.com"
            className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="text-sm font-semibold text-slate-950">
          Website
          <input
            value={agencyWebsite}
            onChange={(event) => setAgencyWebsite(event.target.value)}
            placeholder="https://example.com"
            className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="text-sm font-semibold text-slate-950">
          Logo URL optional
          <input
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            placeholder="https://example.com/logo.png"
            className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={saveProfile}
        disabled={saving}
        className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        {saving ? "Saving..." : "Save profile"}
      </button>
      {status && (
        <p className="mt-3 text-sm font-medium text-slate-700" aria-live="polite">
          {status}
        </p>
      )}
    </section>
  );
}
