import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SeverityBadge, StatusBadge } from "@/components/severity-badge";
import { StatBox } from "@/components/stat-box";
import { VoteSection } from "./vote-section";
import { statusLabel, typeLabel } from "@/lib/format";

const REPAIR_STEPS = [
  { key: "reported",     label: "Reported" },
  { key: "acknowledged", label: "Ack"      },
  { key: "scheduled",    label: "Sched"    },
  { key: "in_progress",  label: "In prog"  },
  { key: "resolved",     label: "Resolved" },
];

function stepIndex(status: string) {
  return REPAIR_STEPS.findIndex(s => s.key === status);
}

export default async function HazardDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const hazard = await db.hazard.findFirst({
    where: { slug: params.slug, deletedAt: null },
    include: {
      createdBy: { select: { id: true, username: true } },
    },
  });

  if (!hazard) notFound();

  const daysOpen = Math.floor(
    (Date.now() - hazard.createdAt.getTime()) / 86_400_000
  );

  const SLA_DAYS = 3;
  const slaExceededBy = Math.max(0, daysOpen - SLA_DAYS);
  const activeIdx = stepIndex(hazard.repairStatus);

  const title = hazard.name ?? params.slug
    .split("-")
    .map(w => (w[0]?.toUpperCase() ?? "") + w.slice(1))
    .join(" ");

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
              &ldquo;{title}&rdquo;
            </h1>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <SeverityBadge
                severity={
                  hazard.severityScore >= 60 ? "critical"
                  : hazard.severityScore >= 30 ? "high"
                  : hazard.severityScore >= 8  ? "moderate"
                  : "low"
                }
              />
              <StatusBadge status={statusLabel(hazard.repairStatus)} />
            </div>
            <p className="text-sm text-[#9ca3af] flex items-center gap-1.5">
              <PinIcon />
              {hazard.cityCode ?? "Philadelphia, PA"}
            </p>
            {hazard.createdBy && (
              <p className="text-xs text-[#6b7280] mt-1">
                Reported by{" "}
                <Link href={`/profile/${hazard.createdBy.username}`} className="text-[#9ca3af] hover:text-white">
                  @{hazard.createdBy.username}
                </Link>
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <StatBox value={String(daysOpen)} label="Days open" accent={daysOpen > 30} />
            <StatBox value={String(hazard.upvotes)} label="Upvotes" />
          </div>

          {/* Vote velocity */}
          <div className="bg-[#222] border border-[#333] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#e5521e] font-semibold">
              <span className="text-lg">↑</span>
              <span>{hazard.upvotes > 50 ? "Accelerating" : hazard.upvotes > 10 ? "Active" : "Low"}</span>
            </div>
            <p className="text-xs text-[#6b7280] mt-1">Vote velocity</p>
          </div>

          {/* Repair status stepper */}
          <div>
            <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-3">Repair Status</p>
            <div className="flex items-center gap-1">
              {REPAIR_STEPS.map((step, i) => {
                const isDone   = i < activeIdx;
                const isActive = i === activeIdx;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className={`flex-1 py-1 text-[10px] font-medium rounded text-center
                      ${isActive ? "bg-[#e5521e]/20 text-[#e5521e] border border-[#e5521e]/30"
                        : isDone  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-[#222] text-[#6b7280] border border-[#333]"}`}>
                      {step.label}
                    </div>
                    {i < REPAIR_STEPS.length - 1 && (
                      <div className={`w-1 h-px flex-shrink-0 ${isDone ? "bg-emerald-500" : "bg-[#333]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* City work order */}
          {hazard.cityTicketId ? (
            <div className="bg-[#1a2e1a] border border-emerald-800/40 rounded-lg px-4 py-2.5">
              <p className="text-xs text-emerald-400">
                City ticket: <span className="font-mono">{hazard.cityTicketId}</span>
              </p>
            </div>
          ) : (
            <button className="w-full py-2.5 text-sm font-medium text-[#f5f5f5] bg-[#222]
                               border border-[#444] rounded-lg hover:border-[#888] transition-colors">
              Link city work order
            </button>
          )}

          {/* Export */}
          <div className="bg-[#222] border border-[#333] rounded-lg p-4">
            <p className="text-xs font-semibold text-[#9ca3af] mb-3">Export data</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <a href={`/api/v1/exports/geojson?hazardId=${hazard.id}`} download
                 className="py-2 text-xs font-medium text-center text-[#f5f5f5] bg-[#2a2a2a] border border-[#444] rounded-lg hover:border-[#888]">
                🗺 GeoJSON
              </a>
              <a href={`/api/v1/exports/csv?hazardId=${hazard.id}`} download
                 className="py-2 text-xs font-medium text-center text-[#f5f5f5] bg-[#2a2a2a] border border-[#444] rounded-lg hover:border-[#888]">
                📊 CSV
              </a>
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
              {Array.isArray(hazard.images) && hazard.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={String(hazard.images[0])} alt={hazard.name ?? ""} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-center text-[#444]">
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-sm">No photo yet</p>
                </div>
              )}
            </div>
            <div className="bg-[#1a1a1a] map-grid border border-[#333] rounded-xl h-56 relative overflow-hidden">
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#e5521e] ring-2 ring-[#e5521e]/30" />
              {hazard.latitude && hazard.longitude && (
                <p className="absolute bottom-2 left-0 right-0 text-center text-[9px] text-[#6b7280] font-mono">
                  {Number(hazard.latitude).toFixed(4)}°N {Math.abs(Number(hazard.longitude)).toFixed(4)}°W
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">
              {typeLabel(hazard.type)} · {statusLabel(hazard.repairStatus)}
            </p>
            <p className="text-sm text-[#f5f5f5] leading-relaxed">
              {hazard.description ?? "No description provided."}
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-5">
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-4">Timeline</p>
            <div className="space-y-3">
              <TimelineItem label="Reported" date={hazard.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} done />
              {activeIdx >= 1 && <TimelineItem label="Acknowledged" date="City notified" done />}
              {activeIdx >= 2 && <TimelineItem label="Scheduled for inspection" date="" done />}
              <TimelineItem
                label={activeIdx < 2 ? "Inspection Scheduled" : "Repair"}
                date={activeIdx < 2 ? "Pending" : "Pending inspection"}
                active={activeIdx < 4}
                done={activeIdx === 4}
              />
              {activeIdx === 4 && hazard.resolvedAt && (
                <TimelineItem label="Resolved" date={hazard.resolvedAt.toLocaleDateString()} done />
              )}
            </div>
          </div>

          {/* Vote + Community name */}
          <div className="grid grid-cols-2 gap-4">
            <VoteSection
              hazardId={hazard.id}
              upvotes={hazard.upvotes}
              downvotes={hazard.downvotes}
              severityScore={hazard.severityScore}
            />

            {/* Community name + verify */}
            <div className="space-y-4">
              <div className="bg-[#222] border border-[#333] rounded-xl p-5">
                <p className="text-sm font-semibold text-[#f5f5f5] mb-1">Community name</p>
                <p className="text-base font-bold text-[#e5521e] mb-1">&ldquo;{hazard.name}&rdquo;</p>
                <p className="text-xs text-[#6b7280] mb-3">{hazard.upvotes} votes</p>
                <input type="text" placeholder="Propose a different name..." className="w-full text-sm" />
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
            <div className="text-5xl font-mono font-bold text-[#ef4444] mb-1">{daysOpen}</div>
            <div className="text-xs font-bold text-[#ef4444] uppercase tracking-widest mb-1">Days without repair</div>
            {slaExceededBy > 0 && (
              <div className="text-xs text-[#9ca3af] mb-3">SLA exceeded by {slaExceededBy} days</div>
            )}
            <button className="text-sm text-[#e5521e] hover:text-[#f97316] font-medium underline decoration-dotted">
              Share to increase pressure 🔥
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function TimelineItem({
  label, date, done = false, active = false,
}: { label: string; date: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0
        ${active ? "bg-[#e5521e]" : done ? "bg-emerald-500" : "bg-[#333]"}`} />
      <div>
        <p className={`text-sm font-medium ${active ? "text-[#e5521e]" : done ? "text-[#f5f5f5]" : "text-[#4b5563]"}`}>
          {label}
        </p>
        {date && <p className="text-xs text-[#6b7280] mt-0.5">{date}</p>}
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
