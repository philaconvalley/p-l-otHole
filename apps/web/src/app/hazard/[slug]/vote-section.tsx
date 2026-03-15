"use client";

import { useState } from "react";

const SEVERITY_VOTES = [
  { label: "Low",      value: 1, active: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400", hover: "hover:border-emerald-500/40 hover:text-emerald-400" },
  { label: "Moderate", value: 2, active: "bg-amber-500/20 border-amber-500/50 text-amber-400",     hover: "hover:border-amber-500/40 hover:text-amber-400"   },
  { label: "High",     value: 4, active: "bg-orange-500/20 border-orange-500/50 text-orange-400",  hover: "hover:border-orange-500/40 hover:text-orange-400" },
  { label: "Critical", value: 5, active: "bg-red-500/20 border-red-500/50 text-red-400",           hover: "hover:border-red-500/40 hover:text-red-400"       },
];

interface VoteSectionProps {
  hazardId: string;
  upvotes: number;
  downvotes: number;
  severityScore: number;
}

export function VoteSection({ hazardId, upvotes: initialUp, severityScore }: VoteSectionProps) {
  const [voted, setVoted]   = useState<number | null>(null);
  const [upvotes, setUpvotes] = useState(initialUp);
  const [pending, setPending] = useState(false);
  const [msg, setMsg]         = useState<string | null>(null);

  async function castVote(value: number) {
    if (pending) return;
    setPending(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/v1/hazards/${hazardId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        setVoted(value);
        if (value >= 4) setUpvotes(u => u + 1);
        setMsg("Vote recorded");
      } else if (res.status === 401) {
        setMsg("Sign in to vote");
      } else {
        setMsg("Could not record vote");
      }
    } catch {
      setMsg("Network error");
    } finally {
      setPending(false);
    }
  }

  const SEVERITY_DIST = [
    { label: "Critical", pct: Math.min(100, severityScore),     color: "bg-red-500"    },
    { label: "High",     pct: Math.min(100, severityScore * .5),color: "bg-orange-500" },
    { label: "Moderate", pct: Math.min(100, severityScore * .3),color: "bg-amber-500"  },
    { label: "Low",      pct: Math.max(0,  100 - severityScore),color: "bg-emerald-500"},
  ];

  return (
    <div className="bg-[#222] border border-[#333] rounded-xl p-5">
      <p className="text-sm font-semibold text-[#f5f5f5] mb-4">Vote severity</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {SEVERITY_VOTES.map(({ label, value, active, hover }) => (
          <button
            key={label}
            onClick={() => castVote(value)}
            disabled={pending}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
              ${voted === value
                ? active
                : `bg-[#2a2a2a] border-[#444] text-[#9ca3af] ${hover}`}
              ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      {msg && (
        <p className={`text-xs mb-3 ${msg === "Vote recorded" ? "text-emerald-400" : "text-[#9ca3af]"}`}>
          {msg}
        </p>
      )}
      <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">
        Severity distribution · {upvotes} upvotes
      </p>
      <div className="space-y-2">
        {SEVERITY_DIST.map(({ label, pct, color }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-[#9ca3af] w-14">{label}</span>
            <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-[#6b7280] font-mono w-8 text-right">{Math.round(pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
