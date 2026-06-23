const plans = [
  {
    name: "Free / Trial",
    description: "Validate manual scanning workflows before connecting billing.",
    features: ["Manual scans", "Limited domains", "Local dashboard preview"],
  },
  {
    name: "Pro",
    description: "For small teams that need recurring monitoring and reports.",
    features: [
      "Scheduled scans",
      "Email reports",
      "AI remediation suggestions",
    ],
  },
  {
    name: "Business",
    description: "For agencies and larger SMBs managing multiple properties.",
    features: [
      "More domains",
      "Priority reports",
      "Team access placeholder",
    ],
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Billing
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Subscription plans
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Billing integration will be added in a future phase. Pricing below is
          a product-structure placeholder for domain and report limits.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-950">{plan.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {plan.description}
            </p>
            <ul className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="text-sm font-medium text-slate-700">
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled
              className="mt-6 w-full rounded-md bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-600"
            >
              Billing not connected
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Future billing scope</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Paid plans should eventually gate domain count, scheduled scan
          frequency, report volume, AI usage, team seats, and retention history.
          Do not add real Stripe keys or billing webhooks until the billing MVP.
        </p>
      </section>
    </div>
  );
}
