"use client";

import { useState } from "react";

const SEVERITY_OPTIONS = [
  { label: "Low", bgActive: "bg-emerald-500/20", borderActive: "border-emerald-500/50", textActive: "text-emerald-400", barColor: "bg-emerald-500" },
  { label: "Moderate", bgActive: "bg-amber-500/20", borderActive: "border-amber-500/50", textActive: "text-amber-400", barColor: "bg-amber-500" },
  { label: "High", bgActive: "bg-[#F99300]/20", borderActive: "border-[#F99300]/50", textActive: "text-[#F99300]", barColor: "bg-[#F99300]" },
  { label: "Critical", bgActive: "bg-red-500/20", borderActive: "border-red-500/50", textActive: "text-red-400", barColor: "bg-red-500" },
] as const;

type SeverityLabel = typeof SEVERITY_OPTIONS[number]["label"];

interface VoteSeverityCardProps {
  initialSelected?: SeverityLabel;
  distribution?: { label: SeverityLabel; pct: number }[];
}

const DEFAULT_DISTRIBUTION: { label: SeverityLabel; pct: number }[] = [
  { label: "Critical", pct: 72 },
  { label: "High", pct: 18 },
  { label: "Moderate", pct: 8 },
  { label: "Low", pct: 2 },
];

export function VoteSeverityCard({
  initialSelected = "Critical",
  distribution = DEFAULT_DISTRIBUTION,
}: VoteSeverityCardProps) {
  const [selected, setSelected] = useState<SeverityLabel>(initialSelected);

  return (
    <div className="bg-[#222] border border-[#333] rounded-xl p-5">
      <p className="text-sm font-semibold text-[#f5f5f5] mb-4">Vote severity</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {SEVERITY_OPTIONS.map((option) => {
          const isSelected = selected === option.label;
          return (
            <button
              key={option.label}
              onClick={() => setSelected(option.label)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                ${isSelected
                  ? `${option.bgActive} ${option.borderActive} ${option.textActive}`
                  : "bg-[#2a2a2a] border-[#444] text-[#9ca3af] hover:border-[#888]"
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Severity distribution</p>
      <div className="space-y-2">
        {distribution.map(({ label, pct }) => {
          const option = SEVERITY_OPTIONS.find((o) => o.label === label);
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-[#9ca3af] w-14">{label}</span>
              <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                <div
                  className={`h-full ${option?.barColor ?? "bg-gray-500"} rounded-full`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-[#6b7280] font-mono w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
