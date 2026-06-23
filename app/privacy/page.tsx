import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy notes for Web Exposure Check.",
};

const sections = [
  {
    title: "Information you enter",
    text: "The scanner uses the domain you submit to perform public checks. Do not submit domains unless you own them, administer them, or have permission to review them.",
  },
  {
    title: "Local scan history",
    text: "Scan history is stored in your browser localStorage so you can revisit recent results on the same device. You can clear it from the scan page.",
  },
  {
    title: "No sensitive secrets",
    text: "The tool is designed for public domain configuration checks. It should not be used to submit passwords, private keys, tokens, or confidential internal hostnames.",
  },
  {
    title: "Hosting and logs",
    text: "If deployed to a hosting platform, normal platform logs may include request metadata such as timestamps, routes, and network information.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Privacy
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          Privacy notes
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-600">
          Web Exposure Check is intended to keep inputs simple and avoid
          collecting sensitive information. These notes describe how the app is
          designed to handle the information involved in a scan.
        </p>

        <div className="mt-10 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border border-slate-200 bg-slate-50 p-6"
            >
              <h2 className="text-lg font-semibold text-slate-950">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {section.text}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
