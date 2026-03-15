"use client";

import { useState } from "react";
import { HazardCard } from "@/components/hazard-card";

const NEARBY_HAZARDS = [
  { id: "1", slug: "the-abyss-on-5th",    name: "The Abyss on 5th",     severity: "critical" as const, daysOpen: 47, votes: 218, type: "Pothole"    },
  { id: "2", slug: "lake-crater-broad",   name: "Lake Crater, Broad",   severity: "high"     as const, daysOpen: 23, votes:  94, type: "Cave-in"    },
  { id: "3", slug: "sinky-mcsinkface",    name: "Sinky McSinkface",     severity: "moderate" as const, daysOpen:  8, votes:  31, type: "Depression" },
  { id: "4", slug: "the-daily-grind",     name: "The Daily Grind",      severity: "low"      as const, daysOpen:  3, votes:  12, type: "Push-up"    },
  { id: "5", slug: "kensington-krater",   name: "Kensington Krater",    severity: "critical" as const, daysOpen: 45, votes:  54, type: "Pothole"    },
  { id: "6", slug: "passyunk-puddle-trap",name: "Passyunk Puddle Trap", severity: "moderate" as const, daysOpen: 12, votes:  23, type: "Drainage"   },
];

const SEVERITY_COUNTS = [
  { label: "Critical", count: 18, cls: "bg-red-500/15 text-red-400 border-red-500/30"         },
  { label: "High",     count: 42, cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  { label: "Moderate", count: 91, cls: "bg-amber-600/15 text-amber-400 border-amber-600/30"   },
  { label: "Low",      count: 96, cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
];

const VIEW_MODES = ["Map view", "Heatmap", "Clusters"];

export default function MapPage() {
  const [severityFilter, setSeverityFilter]     = useState("All");
  const [statusFilter, setStatusFilter]         = useState("Open");
  const [viewMode, setViewMode]                 = useState("Map view");
  const [activeSeverities, setActiveSeverities] = useState<Set<string>>(new Set());

  const toggleSeverity = (label: string) =>
    setActiveSeverities(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">

      {/* ── Left filter sidebar ─────────────────────────────── */}
      <aside className="w-52 flex-shrink-0 bg-[#171717] border-r border-[#2a2a2a] flex flex-col overflow-y-auto scrollbar-hidden">
        {/* Search */}
        <div className="p-3 border-b border-[#2a2a2a]">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7280]">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search hazards..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#222] border border-[#333]
                         rounded-lg placeholder-[#4b5563] focus:border-[#e5521e] outline-none"
            />
          </div>
        </div>

        {/* Quick filters */}
        <div className="p-3 border-b border-[#2a2a2a]">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {["All", "Critical", "High"].map((f) => (
              <button key={f} onClick={() => setSeverityFilter(f)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors
                  ${severityFilter === f ? "bg-[#e5521e] text-white border-[#e5521e]" : "text-[#9ca3af] border-[#444] hover:border-[#888]"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {["Open", "Resolved"].map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors
                  ${statusFilter === f ? "bg-[#e5521e] text-white border-[#e5521e]" : "text-[#9ca3af] border-[#444] hover:border-[#888]"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div className="p-3 border-b border-[#2a2a2a]">
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">Severity</p>
          <div className="space-y-1.5">
            {SEVERITY_COUNTS.map(({ label, count, cls }) => (
              <div key={label} onClick={() => toggleSeverity(label)}
                className={`flex items-center justify-between cursor-pointer rounded px-1 py-0.5 transition-colors
                  ${activeSeverities.has(label) ? "bg-[#2a2a2a]" : "hover:bg-[#222]"}`}>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}
                  ${activeSeverities.has(label) ? "ring-1 ring-current" : ""}`}>{label}</span>
                <span className="text-xs text-[#6b7280] font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="p-3 border-b border-[#2a2a2a]">
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">Status</p>
          <div className="space-y-1">
            {["Reported", "Acknowledged", "Scheduled", "In progress", "Resolved"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`block w-full text-left text-xs py-0.5 px-1 rounded transition-colors
                  ${statusFilter === s ? "text-white bg-[#2a2a2a]" : "text-[#9ca3af] hover:text-white"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* View */}
        <div className="p-3">
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">View</p>
          <div className="space-y-1">
            {VIEW_MODES.map((v) => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`block w-full text-left text-xs py-1 px-2 rounded transition-colors
                  ${viewMode === v ? "bg-[#2a2a2a] text-white" : "text-[#9ca3af] hover:text-white"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Map center ──────────────────────────────────────── */}
      <main className="flex-1 relative overflow-hidden bg-[#1a1a1a] map-grid">
        <div className="absolute top-[28%] left-[35%] w-9 h-9 rounded-full bg-[#e5521e]
                        text-white text-sm font-bold flex items-center justify-center
                        shadow-lg shadow-orange-900/40 cursor-pointer">5</div>
        <div className="absolute top-[45%] left-[22%] w-9 h-9 rounded-full bg-[#e5521e]
                        text-white text-sm font-bold flex items-center justify-center
                        shadow-lg shadow-orange-900/40 cursor-pointer">7</div>
        <div className="absolute top-[60%] left-[58%] w-8 h-8 rounded-full bg-[#2a2a2a]
                        border-2 border-[#d97706] text-[#d97706] text-xs font-bold
                        flex items-center justify-center cursor-pointer">3</div>
        <div className="absolute top-[65%] right-[25%] w-8 h-8 rounded-full bg-[#2a2a2a]
                        border-2 border-[#6b7280] text-[#9ca3af] text-xs font-bold
                        flex items-center justify-center cursor-pointer">2</div>

        <div className="absolute top-[38%] left-[48%] flex flex-col items-center cursor-pointer">
          <div className="bg-[#222] border border-[#444] rounded px-2 py-0.5 text-xs text-[#f5f5f5] whitespace-nowrap mb-1 shadow-lg">
            The Abyss on 5th
          </div>
          <div className="w-3 h-3 rounded-full bg-[#e5521e] ring-2 ring-[#e5521e]/30" />
        </div>
        <div className="absolute top-[70%] left-[32%] flex flex-col items-center cursor-pointer">
          <div className="bg-[#222] border border-[#444] rounded px-2 py-0.5 text-xs text-[#f5f5f5] whitespace-nowrap mb-1 shadow-lg">
            Lake Crater
          </div>
          <div className="w-3 h-3 rounded-full bg-[#d97706] ring-2 ring-[#d97706]/30" />
        </div>

        {(severityFilter !== "All" || activeSeverities.size > 0) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#e5521e]/90
                          rounded-full text-xs text-white font-medium pointer-events-none">
            Filtering: {[severityFilter !== "All" && severityFilter, ...Array.from(activeSeverities)].filter(Boolean).join(", ")}
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-1">
          <button className="w-8 h-8 bg-[#222] border border-[#444] rounded flex items-center justify-center text-white hover:bg-[#2a2a2a] font-light text-lg">+</button>
          <button className="w-8 h-8 bg-[#222] border border-[#444] rounded flex items-center justify-center text-white hover:bg-[#2a2a2a] font-light text-xl leading-none">−</button>
        </div>

        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-[#222]/90 border border-[#444] rounded-full text-xs text-[#9ca3af] font-mono">
          247 hazards shown
        </div>
      </main>

      {/* ── Right hazard list ─────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 bg-[#171717] border-l border-[#2a2a2a] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#2a2a2a]">
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">Active Filters</p>
          <div className="flex flex-wrap gap-1.5">
            {[severityFilter, statusFilter !== "Open" ? statusFilter : null, ...Array.from(activeSeverities)]
              .filter((f): f is string => !!f)
              .filter((f, i, arr) => arr.indexOf(f) === i)
              .map((f) => (
                <span key={f} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e5521e] text-white">{f}</span>
              ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          <div className="p-4 pb-2">
            <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest">Nearby Hazards</p>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {NEARBY_HAZARDS.map((h) => (
              <HazardCard key={h.id} {...h} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
