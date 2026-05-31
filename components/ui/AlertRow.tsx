import type { Alert, AlertSeverity } from "@/types";

const severityStyles: Record<
  AlertSeverity,
  { badge: string; label: string }
> = {
  HIGH: {
    badge: "bg-error/20 text-error border border-error/30",
    label: "HIGH",
  },
  MED: {
    badge: "bg-secondary/20 text-on-secondary-container border border-outline",
    label: "MED",
  },
  CRIT: {
    badge: "bg-error text-black",
    label: "CRIT",
  },
};

interface AlertRowProps {
  alert: Alert;
}

export default function AlertRow({ alert }: AlertRowProps) {
  const { badge, label } = severityStyles[alert.severity];

  return (
    <div className="flex items-center gap-4 p-4 border border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition-colors">
      <span className={`px-2 py-1 type-telemetry-sm text-[10px] ${badge}`}>
        {label}
      </span>
      <div className="flex-1 type-telemetry-md">{alert.message}</div>
      <div className="type-telemetry-sm text-on-surface-variant">
        {alert.source}
      </div>
    </div>
  );
}
