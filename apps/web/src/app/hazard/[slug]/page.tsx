import Link from "next/link";
import { SeverityBadge, StatusBadge } from "@/components/severity-badge";
import { StatBox } from "@/components/stat-box";

const REPAIR_STEPS = ["Reported", "Ack", "Sched", "In prog", "Resolved"];

const TIMELINE = [
  { label: "Reported",                  date: "Feb 17, 2026 — by @mlampkin · photo attached",        done: true  },
  { label: "Submitted to Philly 311",   date: "Feb 18, 2026 — Ref #PHI-2026-04892",                  done: true  },
  { label: "Acknowledged by Streets Dept", date: "Feb 21, 2026 — SEPTA notified (Bus Route 47)",    done: true  },
  { label: "Inspection Scheduled",      date: "Apr 3, 2026 — 6-week delay flagged",                  active: true },
  { label: "Repair",                    date: "Estimated within 3 business days of inspection",       done: false },
];

const SEVERITY_DIST = [
  { label: "Critical", pct: 72, color: "bg-red-500"    },
  { label: "High",     pct: 18, color: "bg-orange-500" },
  { label: "Moderate", pct:  8, color: "bg-amber-500"  },
  { label: "Low",      pct:  2, color: "bg-emerald-500"},
];

export default function HazardDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#171717]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

        {/* ── Left sidebar ─────────────────────────────────── */}
        <aside className="lg:w-72 flex-shrink-0 space-y-5">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-white transition-colors">
            <span>←</span> Back to map
          </Link>

          {/* Name + badges */}
          <div>
            <h1 className="text-2xl font-bold text-[#f5f5f5] mb-3 leading-tight">
              &ldquo;{params.slug.split("-").map(w => (w[0]?.toUpperCase() ?? "") + w.slice(1)).join(" ")}&rdquo;
            </h1>
            <div className="flex items-center gap-2 mb-3">
              <SeverityBadge severity="critical" />
              <StatusBadge status="Reported" />
            </div>
            <p className="text-sm text-[#9ca3af] flex items-center gap-1.5">
              <PinIcon />
              1247 S 5th St, South Philadelphia
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <StatBox value="47"  label="Days open" accent />
            <StatBox value="84"  label="Votes"     />
          </div>

          {/* Vote velocity */}
          <div className="bg-[#222] border border-[#333] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#e5521e] font-semibold">
              <span className="text-lg">↑↑</span>
              <span>Accelerating</span>
            </div>
            <p className="text-xs text-[#6b7280] mt-1">Vote velocity</p>
          </div>

          {/* Repair status stepper */}
          <div>
            <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-3">Repair Status</p>
            <div className="flex items-center gap-1">
              {REPAIR_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <button className={`flex-1 py-1 text-[10px] font-medium rounded text-center
                    ${i === 0 ? "bg-[#e5521e]/20 text-[#e5521e] border border-[#e5521e]/30"
                              : "bg-[#222] text-[#6b7280] border border-[#333]"}`}>
                    {step}
                  </button>
                  {i < REPAIR_STEPS.length - 1 && <div className="w-1 h-px bg-[#333] flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* City work order */}
          <button className="w-full py-2.5 text-sm font-medium text-[#f5f5f5] bg-[#222]
                             border border-[#444] rounded-lg hover:border-[#888] transition-colors">
            Link city work order
          </button>

          {/* Export */}
          <div className="bg-[#222] border border-[#333] rounded-lg p-4">
            <p className="text-xs font-semibold text-[#9ca3af] mb-3">Export data</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button className="py-2 text-xs font-medium text-[#f5f5f5] bg-[#2a2a2a] border border-[#444] rounded-lg hover:border-[#888]">
                🗺 GeoJSON
              </button>
              <button className="py-2 text-xs font-medium text-[#f5f5f5] bg-[#2a2a2a] border border-[#444] rounded-lg hover:border-[#888]">
                📊 CSV
              </button>
            </div>
            <button className="w-full py-2 text-xs font-medium text-[#f5f5f5] bg-[#2a2a2a] border border-[#444] rounded-lg hover:border-[#888]">
              🏛 City-Ready Report (311)
            </button>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────── */}
        <main className="flex-1 space-y-6">
          {/* Photo + mini-map */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-[#222] border border-[#333] rounded-xl h-56 flex items-center justify-center">
              <div className="text-center text-[#444]">
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm">[ verified photo ]</p>
              </div>
            </div>
            <div className="bg-[#1a1a1a] map-grid border border-[#333] rounded-xl h-56 relative overflow-hidden">
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#e5521e] ring-2 ring-[#e5521e]/30" />
              <p className="absolute bottom-2 left-0 right-0 text-center text-[9px] text-[#6b7280]">
                Verified pin location
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Reported description</p>
            <p className="text-sm text-[#f5f5f5] leading-relaxed">
              Large pothole spanning full lane, estimated 18&quot; × 14&quot; × 4&quot; deep.
              Significant vehicle damage risk. Near bus stop. Axle-deep during rain.
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-5">
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-4">Timeline</p>
            <div className="space-y-3">
              {TIMELINE.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0
                    ${item.active ? "bg-[#e5521e]" : item.done ? "bg-emerald-500" : "bg-[#333]"}`} />
                  <div>
                    <p className={`text-sm font-medium ${item.active ? "text-[#e5521e]" : item.done ? "text-[#f5f5f5]" : "text-[#4b5563]"}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vote + Community name */}
          <div className="grid grid-cols-2 gap-4">
            {/* Vote severity */}
            <div className="bg-[#222] border border-[#333] rounded-xl p-5">
              <p className="text-sm font-semibold text-[#f5f5f5] mb-4">Vote severity</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Low", "Moderate", "High", "Critical"].map((s, i) => (
                  <button key={s} className={`px-3 py-1.5 rounded-lg text-sm font-medium border
                    ${i === 3
                      ? "bg-red-500/20 border-red-500/50 text-red-400"
                      : "bg-[#2a2a2a] border-[#444] text-[#9ca3af] hover:border-[#888]"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Severity distribution</p>
              <div className="space-y-2">
                {SEVERITY_DIST.map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-[#9ca3af] w-14">{label}</span>
                    <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-[#6b7280] font-mono w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community name + verify */}
            <div className="space-y-4">
              <div className="bg-[#222] border border-[#333] rounded-xl p-5">
                <p className="text-sm font-semibold text-[#f5f5f5] mb-1">Community name</p>
                <p className="text-base font-bold text-[#e5521e] mb-1">&ldquo;The Abyss on 5th&rdquo;</p>
                <p className="text-xs text-[#6b7280] mb-3">82 votes · leading proposal</p>
                <input
                  type="text"
                  placeholder="Propose a different name..."
                  className="w-full text-sm"
                />
              </div>

              <div className="bg-[#222] border border-[#333] rounded-xl p-5">
                <p className="text-sm font-semibold text-[#f5f5f5] mb-2">In-person verify</p>
                <p className="text-xs text-[#9ca3af] mb-4">
                  Confirm this hazard exists at the pinned location. +15 pts.
                </p>
                <button className="w-full py-2.5 text-sm font-semibold text-white bg-[#2a2a2a]
                                   border border-[#444] rounded-lg hover:border-[#888] hover:bg-[#333] transition-colors">
                  Mark as verified (+15 pts)
                </button>
              </div>
            </div>
          </div>

          {/* Days without repair banner */}
          <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-6 text-center">
            <div className="text-5xl font-mono font-bold text-[#ef4444] mb-1">47</div>
            <div className="text-xs font-bold text-[#ef4444] uppercase tracking-widest mb-1">Days without repair</div>
            <div className="text-xs text-[#9ca3af] mb-3">SLA exceeded by 44 days</div>
            <button className="text-sm text-[#e5521e] hover:text-[#f97316] font-medium underline decoration-dotted">
              Share to increase pressure 🔥
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  );
}
