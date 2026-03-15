export const dynamic = "force-dynamic";
import { StatBox } from "@/components/stat-box";
import { SeverityBadge } from "@/components/severity-badge";
import { db } from "@/lib/db";
import { statusLabel, severityLabel } from "@/lib/format";

const REPAIR_STATUSES = ["reported", "acknowledged", "scheduled", "in_progress", "resolved"] as const;

async function getStats() {
  // Avoid count() with enum filters — @prisma/adapter-pg casts to "public.RepairStatus"
  // which doesn't match the actual DB type name "repair_status". Instead, fetch all
  // hazards with just the fields we need and compute everything in JS.
  const all = await db.hazard.findMany({
    where: { deletedAt: null },
    orderBy: { upvotes: "desc" },
    select: {
      id: true, slug: true, name: true,
      repairStatus: true, severityScore: true,
      upvotes: true, createdAt: true,
    },
  });

  const total    = all.length;
  const resolved = all.filter(h => h.repairStatus === "resolved").length;
  const open     = total - resolved;

  const statusRows = REPAIR_STATUSES.map(key => ({
    repairStatus: key,
    count: all.filter(h => h.repairStatus === key).length,
  }));

  const topHazards = all
    .filter(h => h.repairStatus !== "resolved")
    .slice(0, 5);

  const openHazards = all.filter(h => h.repairStatus !== "resolved");

  const critical   = topHazards.filter(h => h.severityScore >= 60 || h.upvotes >= 100).length;
  const avgDaysOpen = openHazards.length
    ? Math.round(openHazards.reduce((s, h) => s + (Date.now() - h.createdAt.getTime()) / 86_400_000, 0) / openHazards.length)
    : 0;

  return { open, critical, avgDaysOpen, statusRows, topHazards };
}

export default async function DashboardPage() {
  const { open, critical, avgDaysOpen, statusRows, topHazards } = await getStats();

  const maxCount = Math.max(...statusRows.map(r => r.count), 1);
  const statusData = statusRows.map(({ repairStatus: key, count }) => ({
    label: statusLabel(key),
    count,
    cls:
      key === "reported"     ? "bg-[#F99300]" :
      key === "acknowledged" ? "bg-[#f97316]" :
      key === "scheduled"    ? "bg-[#d97706]" :
      key === "in_progress"  ? "bg-[#2563eb]" : "bg-[#10b981]",
    badgeCls:
      key === "reported"     ? "bg-[#F99300]/15 text-[#F99300] border-[#F99300]/30" :
      key === "acknowledged" ? "bg-orange-500/15 text-orange-400 border-orange-500/30" :
      key === "scheduled"    ? "bg-amber-600/15 text-amber-400 border-amber-600/30" :
      key === "in_progress"  ? "bg-blue-600/15 text-blue-400 border-blue-600/30" :
                               "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  }));

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#171717] p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f5f5f5]">Philadelphia civic pressure</h1>
            <p className="text-sm text-[#6b7280] mt-1">Live from database</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-[#F99300] rounded-lg hover:bg-[#e07e00] transition-colors">
              Generate pressure card
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox value={String(open)}        label="Total open hazards" />
          <StatBox value={String(critical)}    label="Critical severity"  accent />
          <StatBox value={String(avgDaysOpen)} label="Avg days open"      />
          <div className="bg-[#222] border border-[#333] rounded-lg p-4 flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#f5f5f5] leading-none">
              {open > 20 ? "↑↑" : open > 5 ? "↑" : "→"}
            </span>
            <span className="text-xs text-[#9ca3af] uppercase tracking-wider">Vote velocity trend</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#222] border border-[#333] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#f5f5f5] mb-5">Status breakdown</p>
            <div className="space-y-3">
              {statusData.map(({ label, count, cls, badgeCls }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeCls}`}>
                      {label}
                    </span>
                  </div>
                  <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className={`h-full ${cls} rounded-full`}
                         style={{ width: `${Math.round((count / maxCount) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-[#6b7280] font-mono w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#222] border border-[#333] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#f5f5f5] mb-5">Most upvoted open hazards</p>
            <div className="space-y-3">
              {topHazards.map((h, i) => (
                <div key={h.id} className="flex items-center gap-3">
                  <span className="text-xs text-[#6b7280] font-mono w-4">{i + 1}</span>
                  <a href={"/hazard/" + h.slug} className="flex-1 text-xs text-[#f5f5f5] hover:text-[#F99300] truncate">
                    {h.name}
                  </a>
                  <SeverityBadge severity={severityLabel(h.severityScore, h.upvotes)} />
                  <span className="text-xs text-[#9ca3af] font-mono">{"↑" + h.upvotes}</span>
                </div>
              ))}
              {topHazards.length === 0 && (
                <p className="text-xs text-[#4b5563]">No open hazards yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#222] border border-[#333] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#333]">
            <p className="text-sm font-semibold text-[#f5f5f5]">Top open hazards by pressure</p>
            <span className="text-xs text-[#6b7280]">by upvotes</span>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {topHazards.map((h, i) => {
              const daysOpen = Math.floor((Date.now() - h.createdAt.getTime()) / 86_400_000);
              return (
                <div key={h.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#2a2a2a] transition-colors">
                  <span className="text-sm font-mono text-[#6b7280] w-5">{i + 1}</span>
                  <a href={"/hazard/" + h.slug} className="flex-1 text-sm font-medium text-[#f5f5f5] hover:text-[#F99300]">
                    {h.name}
                  </a>
                  <SeverityBadge severity={severityLabel(h.severityScore, h.upvotes)} />
                  <span className="text-xs text-[#9ca3af] font-mono w-16 text-right">{h.upvotes} votes</span>
                  <span className="text-xs text-[#6b7280] font-mono w-20 text-right">{daysOpen} days old</span>
                  <a href={"/hazard/" + h.slug} className="text-xs text-[#F99300] hover:text-[#f97316] font-medium">View →</a>
                </div>
              );
            })}
            {topHazards.length === 0 && (
              <div className="px-5 py-6 text-center text-xs text-[#4b5563]">No hazards reported yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
