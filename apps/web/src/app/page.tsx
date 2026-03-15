"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { HazardCard } from "@/components/hazard-card";
import { severityLabel, statusLabel, typeLabel, daysAgo } from "@/lib/format";
import type { MapHazard } from "@/components/hazard-map";

const HazardMap = dynamic(
  () => import("@/components/hazard-map").then(m => m.HazardMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#1a1a1a] map-grid flex items-center justify-center">
        <span className="text-[#444] text-sm">Loading map…</span>
      </div>
    ),
  }
);

interface ApiHazard {
  id: string;
  name: string;
  slug: string;
  type: string;
  severityScore: number;
  votes: { up: number; down: number };
  location: { latitude: number; longitude: number };
  reportsCount: number;
  repairStatus: string;
  createdAt: string;
}

const SEVERITY_COUNTS = [
  { label: "Critical", cls: "bg-red-500/15 text-red-400 border-red-500/30"          },
  { label: "High",     cls: "bg-orange-500/15 text-orange-400 border-orange-500/30"  },
  { label: "Moderate", cls: "bg-amber-600/15 text-amber-400 border-amber-600/30"     },
  { label: "Low",      cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
];

const REPAIR_STATUSES = ["reported", "acknowledged", "scheduled", "in_progress", "resolved"];
const VIEW_MODES = ["Map view", "Heatmap", "Clusters"];

export default function MapPage() {
  const [hazards, setHazards]             = useState<ApiHazard[]>([]);
  const [loading, setLoading]             = useState(true);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter]   = useState("Open");
  const [viewMode, setViewMode]           = useState("Map view");
  const [search, setSearch]               = useState("");
  const [activeSeverities, setActiveSeverities] = useState<Set<string>>(new Set());

  const fetchHazards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100", sort: "most_voted" });
      if (statusFilter === "Resolved") params.set("repairStatus", "resolved");
      else if (statusFilter !== "Open") params.set("repairStatus", statusFilter.toLowerCase().replace(" ", "_"));
      if (severityFilter !== "All") params.set("severity", severityFilter.toLowerCase());
      const res = await fetch(`/api/v1/hazards?${params}`);
      const json = await res.json();
      setHazards(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter]);

  useEffect(() => { fetchHazards(); }, [fetchHazards]);

  const toggleSeverity = (label: string) =>
    setActiveSeverities(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  // Client-side filter: search + active severity checkboxes (severity pill already pushed to API)
  const visible = hazards.filter(h => {
    const sev = severityLabel(h.severityScore, h.votes.up);
    const sevOk = activeSeverities.size === 0 || activeSeverities.has(
      sev.charAt(0).toUpperCase() + sev.slice(1)
    );
    const searchOk = !search || h.name?.toLowerCase().includes(search.toLowerCase());
    return sevOk && searchOk;
  });

  // Per-severity counts for sidebar
  const counts = SEVERITY_COUNTS.map(({ label }) => ({
    label,
    count: hazards.filter(h =>
      severityLabel(h.severityScore, h.votes.up) === label.toLowerCase()
    ).length,
  }));

  const hazardCards = visible.map(h => ({
    id: h.id,
    slug: h.slug ?? h.id,
    name: h.name ?? "Unnamed hazard",
    severity: severityLabel(h.severityScore, h.votes.up),
    daysOpen: daysAgo(h.createdAt),
    votes: h.votes.up,
    type: typeLabel(h.type),
  }));

  const mapHazards: MapHazard[] = visible.map(h => ({
    id: h.id,
    slug: h.slug ?? h.id,
    name: h.name ?? "Unnamed hazard",
    severityScore: h.severityScore,
    votes: h.votes,
    location: h.location,
    repairStatus: h.repairStatus,
    type: h.type,
  }));

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">

      {/* ── Left filter sidebar ─────────────────────────────── */}
      <aside className="w-52 flex-shrink-0 bg-[#171717] border-r border-[#2a2a2a] flex flex-col overflow-y-auto scrollbar-hidden">
        <div className="p-3 border-b border-[#2a2a2a]">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7280]"><SearchIcon /></span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search hazards..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#222] border border-[#333]
                         rounded-lg placeholder-[#4b5563] focus:border-[#F99300] outline-none"
            />
          </div>
        </div>

        <div className="p-3 border-b border-[#2a2a2a]">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {["All", "Critical", "High"].map(f => (
              <button key={f} onClick={() => setSeverityFilter(f)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors
                  ${severityFilter === f ? "bg-[#F99300] text-white border-[#F99300]" : "text-[#9ca3af] border-[#444] hover:border-[#888]"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {["Open", "Resolved"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors
                  ${statusFilter === f ? "bg-[#F99300] text-white border-[#F99300]" : "text-[#9ca3af] border-[#444] hover:border-[#888]"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-b border-[#2a2a2a]">
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">Severity</p>
          <div className="space-y-1.5">
            {counts.map(({ label, count }, i) => (
              <div key={label} onClick={() => toggleSeverity(label)}
                className={`flex items-center justify-between cursor-pointer rounded px-1 py-0.5 transition-colors
                  ${activeSeverities.has(label) ? "bg-[#2a2a2a]" : "hover:bg-[#222]"}`}>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${SEVERITY_COUNTS[i]?.cls ?? ""}
                  ${activeSeverities.has(label) ? "ring-1 ring-current" : ""}`}>{label}</span>
                <span className="text-xs text-[#6b7280] font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-b border-[#2a2a2a]">
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">Status</p>
          <div className="space-y-1">
            {REPAIR_STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(statusLabel(s))}
                className={`block w-full text-left text-xs py-0.5 px-1 rounded transition-colors
                  ${statusFilter === statusLabel(s) ? "text-white bg-[#2a2a2a]" : "text-[#9ca3af] hover:text-white"}`}>
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3">
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">View</p>
          <div className="space-y-1">
            {VIEW_MODES.map(v => (
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
      <main className="flex-1 relative overflow-hidden">
        <HazardMap hazards={mapHazards} viewMode={viewMode} />
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-[#222]/90 border border-[#444] rounded-full text-xs text-[#9ca3af] font-mono pointer-events-none">
          {loading ? "Loading…" : `${visible.length} hazards shown`}
        </div>
      </main>

      {/* ── Right hazard list ─────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 bg-[#171717] border-l border-[#2a2a2a] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#2a2a2a]">
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">Active Filters</p>
          <div className="flex flex-wrap gap-1.5">
            {[severityFilter, statusFilter, ...Array.from(activeSeverities)]
              .filter((f, i, a) => f && a.indexOf(f) === i)
              .map(f => <span key={f} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F99300] text-white">{f}</span>)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          <div className="p-4 pb-2">
            <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest">
              {loading ? "Loading hazards…" : `Nearby Hazards (${hazardCards.length})`}
            </p>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-[#222] rounded-xl animate-pulse" />
                ))
              : hazardCards.map(h => <HazardCard key={h.id} {...h} />)
            }
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
