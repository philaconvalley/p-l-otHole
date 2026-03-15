type Severity = "critical" | "high" | "moderate" | "low";

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-red-500/15 text-red-400 border border-red-500/30",
  high:     "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  moderate: "bg-amber-600/15 text-amber-400 border border-amber-600/30",
  low:      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "CRITICAL",
  high:     "HIGH",
  moderate: "MODERATE",
  low:      "LOW",
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className = "" }: SeverityBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold
        tracking-wider uppercase ${SEVERITY_STYLES[severity]} ${className}
      `}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

export function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        bg-[#2a2a2a] text-[#9ca3af] border border-[#444] uppercase tracking-wide
        ${className}
      `}
    >
      {status}
    </span>
  );
}
