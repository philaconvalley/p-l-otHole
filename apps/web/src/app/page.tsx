"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const sheetDragY = useRef(0);

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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) {
        setMobileFiltersOpen(false);
        setMobileSheetOpen(false);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const closeMobileSheet = useCallback(() => {
    setMobileSheetOpen(false);
    sheetDragY.current = 0;
    if (sheetRef.current) sheetRef.current.style.transform = "";
  }, []);

  const onSheetPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
  }, []);

  const onSheetPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!sheetRef.current || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dy = e.clientY - dragStartY.current;
    if (dy > 0) {
      sheetDragY.current = dy;
      sheetRef.current.style.transform = `translateY(${dy}px)`;
    }
  }, []);

  const onSheetPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (sheetDragY.current > 72) closeMobileSheet();
    else if (sheetRef.current) sheetRef.current.style.transform = "";
    sheetDragY.current = 0;
  }, [closeMobileSheet]);

  const renderFilters = () => (
    <>
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
    </>
  );

  const renderHazardListSection = () => (
    <>
      <div className="p-4 border-b border-[#2a2a2a] shrink-0">
        <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">Active Filters</p>
        <div className="flex flex-wrap gap-1.5">
          {[severityFilter, statusFilter, ...Array.from(activeSeverities)]
            .filter((f, i, a) => f && a.indexOf(f) === i)
            .map(f => <span key={f} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F99300] text-white">{f}</span>)}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
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
    </>
  );

  return (
    <div className="flex map-page-shell overflow-hidden min-h-0">

      {/* ── Left filter sidebar (desktop) ───────────────────── */}
      <aside className="hidden md:flex w-52 flex-shrink-0 bg-[#171717] border-r border-[#2a2a2a] flex-col overflow-y-auto scrollbar-hidden">
        {renderFilters()}
      </aside>

      {/* ── Map center ──────────────────────────────────────── */}
      <main className="flex-1 relative overflow-hidden min-h-0">
        <HazardMap hazards={mapHazards} viewMode={viewMode} />

        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-[#222]/90 border border-[#444] rounded-full text-xs text-[#9ca3af] font-mono pointer-events-none max-w-[calc(100%-8rem)] truncate md:max-w-none">
          {loading ? "Loading…" : `${visible.length} hazards shown`}
        </div>

        {/* Mobile: filters + list */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 md:hidden">
          <button
            type="button"
            aria-expanded={mobileFiltersOpen}
            aria-label="Open filters"
            onClick={() => { setMobileFiltersOpen(true); setMobileSheetOpen(false); }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#444] bg-[#222]/95 text-[#f5f5f5] shadow-lg backdrop-blur-sm transition-colors hover:bg-[#2a2a2a] focus-visible:ring-2 focus-visible:ring-[#F99300]"
          >
            <FilterIcon />
          </button>
          <button
            type="button"
            aria-expanded={mobileSheetOpen}
            aria-label="Open hazard list"
            onClick={() => { setMobileSheetOpen(true); setMobileFiltersOpen(false); }}
            className="flex h-11 min-w-[3rem] items-center justify-center gap-1 rounded-full border border-[#444] bg-[#222]/95 px-3 text-xs font-medium text-[#f5f5f5] shadow-lg backdrop-blur-sm transition-colors hover:bg-[#2a2a2a] focus-visible:ring-2 focus-visible:ring-[#F99300]"
          >
            <ListIcon />
            <span className="font-mono tabular-nums">{hazardCards.length}</span>
          </button>
        </div>
      </main>

      {/* ── Right hazard list (desktop) ───────────────────── */}
      <aside className="hidden md:flex w-80 flex-shrink-0 bg-[#171717] border-l border-[#2a2a2a] flex-col overflow-hidden min-h-0">
        {renderHazardListSection()}
      </aside>

      {/* Mobile: filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-0 flex h-full w-full max-w-sm flex-col bg-[#171717] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
              <span className="text-sm font-semibold text-[#f5f5f5]">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-[#9ca3af] hover:bg-[#2a2a2a] hover:text-white"
              >
                Done
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hidden">
              {renderFilters()}
            </div>
          </div>
        </div>
      )}

      {/* Mobile: hazard list bottom sheet */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Hazard list">
          <button
            type="button"
            aria-label="Close hazard list"
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileSheet}
          />
          <div
            ref={sheetRef}
            className="mobile-hazard-sheet absolute bottom-0 left-0 right-0 flex flex-col overflow-hidden rounded-t-2xl border border-b-0 border-[#2a2a2a] bg-[#171717] shadow-2xl transition-transform"
          >
            <div
              className="flex shrink-0 cursor-grab touch-none flex-col items-center pt-2 pb-1 active:cursor-grabbing"
              onPointerDown={onSheetPointerDown}
              onPointerMove={onSheetPointerMove}
              onPointerUp={onSheetPointerUp}
              onPointerCancel={onSheetPointerUp}
            >
              <div className="h-1 w-10 rounded-full bg-[#444]" aria-hidden />
              <span className="sr-only">Drag down to close</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {renderHazardListSection()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
