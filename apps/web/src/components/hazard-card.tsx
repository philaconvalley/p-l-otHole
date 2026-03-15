import Link from "next/link";
import { SeverityBadge } from "./severity-badge";

type Severity = "critical" | "high" | "moderate" | "low";

interface HazardCardProps {
  id: string;
  slug: string;
  name: string;
  severity: Severity;
  daysOpen: number;
  votes: number;
  type: string;
}

export function HazardCard({
  slug,
  name,
  severity,
  daysOpen,
  votes,
  type,
}: HazardCardProps) {
  return (
    <Link
      href={`/hazard/${slug}`}
      className="block bg-[#222] rounded-lg p-4 hover:bg-[#2a2a2a] border border-[#333]
                 hover:border-[#444] transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <span className="font-semibold text-[#f5f5f5] text-sm leading-snug group-hover:text-white">
          {name}
        </span>
        <SeverityBadge severity={severity} className="flex-shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center gap-3 text-xs text-[#9ca3af]">
        <span className="flex items-center gap-1 text-[#F99300] font-medium">
          <ClockIcon />
          {daysOpen} days open
        </span>
        <span className="flex items-center gap-1">
          <UpvoteIcon />
          {votes} votes
        </span>
        <span className="capitalize">{type}</span>
      </div>
    </Link>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function UpvoteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18,15 12,9 6,15" />
    </svg>
  );
}
