type RiskPillProps = {
  riskLevel: string | null;
};

export function RiskPill({ riskLevel }: RiskPillProps) {
  if (!riskLevel) {
    return (
      <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
        Not scanned
      </span>
    );
  }

  const value = riskLevel.toLowerCase();

  if (value.includes("low")) {
    return (
      <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800">
        {riskLevel}
      </span>
    );
  }

  if (value.includes("medium")) {
    return (
      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
        {riskLevel}
      </span>
    );
  }

  return (
    <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-800">
      {riskLevel}
    </span>
  );
}
