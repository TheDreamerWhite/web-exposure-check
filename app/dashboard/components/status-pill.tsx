import { type DomainStatus, formatDomainStatus } from "./domain-storage";

type StatusPillProps = {
  status: DomainStatus;
};

export function StatusPill({ status }: StatusPillProps) {
  if (status === "paused") {
    return (
      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
        {formatDomainStatus(status)}
      </span>
    );
  }

  return (
    <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800">
      {formatDomainStatus(status)}
    </span>
  );
}
