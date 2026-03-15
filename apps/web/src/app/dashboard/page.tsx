import { StatBox } from "@/components/stat-box";
import { SeverityBadge } from "@/components/severity-badge";

const VELOCITY_DAYS = [
  { day: "Mon", count: 12, max: 34 },
  { day: "Tue", count: 18, max: 34 },
  { day: "Wed", count: 22, max: 34 },
  { day: "Thu", count: 16, max: 34 },
  { day: "Fri", count: 28, max: 34 },
  { day: "Sat", count: 34, max: 34 },
  { day: "Sun", count: 24, max: 34 },
];

const STATUS_BREAKDOWN = [
  { label: "Reported",     count: 94, max: 94, cls: "bg-[#e5521e]"  },
  { label: "Acknowledged", count: 52, max: 94, cls: "bg-[#f97316]"  },
  { label: "Scheduled",    count: 38, max: 94, cls: "bg-[#d97706]"  },
  { label: "In progress",  count: 29, max: 94, cls: "bg-[#2563eb]"  },
  { label: "Resolved",     count: 34, max: 94, cls: "bg-[#10b981]"  },
];

const WORST_STREETS = [
  { rank: 1, street: "Arch St (4th–6th)",   severity: "critical" as const, hazards: 14, avgDays: 71 },
  { rank: 2, street: "Market St / 30th",    severity: "high"     as const, hazards:  9, avgDays: 45 },
  { rank: 3, street: "South St corridor",   severity: "high"     as const, hazards:  7, avgDays: 38 },
  { rank: 4, street: "Broad St / Tasker",   severity: "moderate" as const, hazards:  6, avgDays: 29 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#171717] p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f5f5f5]">Philadelphia civic pressure</h1>
            <p className="text-sm text-[#6b7280] mt-1">Updated 4 minutes ago</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="text-sm px-3 py-1.5 rounded-lg">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-[#e5521e] rounded-lg hover:bg-[#cc4418] transition-colors">
              Generate pressure card
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox value="247" label="Total open hazards" />
          <StatBox value="18"  label="Critical severity"  accent />
          <StatBox value="63"  label="Avg days open"      />
          <div className="bg-[#222] border border-[#333] rounded-lg p-4 flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#f5f5f5] leading-none">↑↑</span>
            <span className="text-xs text-[#9ca3af] uppercase tracking-wider">Vote velocity trend</span>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vote velocity */}
          <div className="bg-[#222] border border-[#333] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#f5f5f5] mb-5">Vote velocity — 7-day</p>
            <div className="space-y-2.5">
              {VELOCITY_DAYS.map(({ day, count, max }) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-xs text-[#9ca3af] w-8 flex-shrink-0">{day}</span>
                  <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e5521e] rounded-full transition-all"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#6b7280] font-mono w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div className="bg-[#222] border border-[#333] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#f5f5f5] mb-5">Status breakdown</p>
            <div className="space-y-3">
              {STATUS_BREAKDOWN.map(({ label, count, max, cls }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium
                      ${label === "Reported"     ? "bg-[#e5521e]/15 text-[#e5521e] border border-[#e5521e]/30" :
                        label === "Acknowledged" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" :
                        label === "Scheduled"    ? "bg-amber-600/15 text-amber-400 border border-amber-600/30" :
                        label === "In progress"  ? "bg-blue-600/15 text-blue-400 border border-blue-600/30" :
                                                   "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"}`}>
                      {label}
                    </span>
                  </div>
                  <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cls} rounded-full`}
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#6b7280] font-mono w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Worst streets leaderboard */}
        <div className="bg-[#222] border border-[#333] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#333]">
            <p className="text-sm font-semibold text-[#f5f5f5]">Worst streets leaderboard</p>
            <span className="text-xs text-[#6b7280]">by hazard density</span>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {WORST_STREETS.map(({ rank, street, severity, hazards, avgDays }) => (
              <div key={rank} className="flex items-center gap-4 px-5 py-4 hover:bg-[#2a2a2a] transition-colors">
                <span className="text-sm font-mono text-[#6b7280] w-5">{rank}</span>
                <span className="flex-1 text-sm font-medium text-[#f5f5f5]">{street}</span>
                <SeverityBadge severity={severity} />
                <span className="text-xs text-[#9ca3af] font-mono w-16 text-right">{hazards} hazards</span>
                <span className="text-xs text-[#6b7280] font-mono w-20 text-right">Avg {avgDays} days</span>
                <button className="text-xs text-[#e5521e] hover:text-[#f97316] font-medium">View →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
