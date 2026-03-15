import { SeverityBadge } from "@/components/severity-badge";

const BADGES = [
  { icon: "🔭", label: "First Report",     earned: true  },
  { icon: "🗳️", label: "100 Votes",        earned: true  },
  { icon: "🏅", label: "Verified Scout",   earned: true  },
  { icon: "🔥", label: "Streak: 7 days",   earned: true  },
  { icon: "🌆", label: "City Mapper",      earned: false },
  { icon: "⚡", label: "Speed Reporter",   earned: false },
  { icon: "🏆", label: "Top 10 City",      earned: false },
  { icon: "🌟", label: "Legend",           earned: false },
];

const RECENT_REPORTS = [
  { slug: "the-abyss-on-5th",    name: "The Abyss on 5th",    severity: "critical" as const, daysOpen: 47, votes: 218 },
  { slug: "kensington-krater",   name: "Kensington Krater",   severity: "critical" as const, daysOpen: 45, votes:  54 },
  { slug: "lake-crater-broad",   name: "Lake Crater, Broad",  severity: "high"     as const, daysOpen: 23, votes:  94 },
  { slug: "passyunk-puddle-trap",name: "Passyunk Puddle Trap",severity: "moderate" as const, daysOpen: 12, votes:  23 },
];

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const displayName = params.username.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#171717] p-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6">

        {/* ── Left sidebar ───────────────────────────────── */}
        <aside className="md:w-64 flex-shrink-0 space-y-4">
          {/* Avatar + name */}
          <div className="bg-[#222] border border-[#333] rounded-xl p-5 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#F99300]/20 border-2 border-[#F99300]/50
                            flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-[#F99300]">{initials}</span>
            </div>
            <h1 className="text-lg font-bold text-[#f5f5f5]">{displayName}</h1>
            <p className="text-xs text-[#6b7280] mt-0.5">@{params.username}</p>
            <p className="text-xs text-[#9ca3af] mt-1 flex items-center gap-1">
              <span>📍</span> Philadelphia, PA
            </p>
          </div>

          {/* Rank + rep */}
          <div className="bg-[#222] border border-[#333] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6b7280] uppercase tracking-widest font-semibold">Rank</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F99300]/15 text-[#F99300] border border-[#F99300]/30">
                Civic Scout
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#9ca3af]">Reputation</span>
                <span className="text-xs font-mono text-[#f5f5f5]">1,240 / 2,000</span>
              </div>
              <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-[#F99300] rounded-full" style={{ width: "62%" }} />
              </div>
              <p className="text-[10px] text-[#4b5563] mt-1">760 pts to City Guardian</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#222] border border-[#333] rounded-xl p-4">
            <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-3">Stats</p>
            <div className="space-y-2.5">
              {[
                { label: "Reports filed",  value: "23"  },
                { label: "Votes cast",     value: "184" },
                { label: "Verified spots", value: "11"  },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af]">{label}</span>
                  <span className="text-sm font-bold text-[#f5f5f5] font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────── */}
        <main className="flex-1 space-y-6">
          {/* Badges */}
          <div className="bg-[#222] border border-[#333] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#f5f5f5] mb-4">Badges</p>
            <div className="grid grid-cols-4 gap-3">
              {BADGES.map(({ icon, label, earned }) => (
                <div
                  key={label}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-center
                    ${earned
                      ? "bg-[#2a2a2a] border-[#444] text-[#f5f5f5]"
                      : "bg-[#1e1e1e] border-[#2a2a2a] text-[#4b5563] opacity-50"}`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[10px] font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent reports */}
          <div className="bg-[#222] border border-[#333] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#333]">
              <p className="text-sm font-semibold text-[#f5f5f5]">Recent reports</p>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
              {RECENT_REPORTS.map(({ slug, name, severity, daysOpen, votes }) => (
                <a
                  key={slug}
                  href={`/hazard/${slug}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#2a2a2a] transition-colors"
                >
                  <span className="flex-1 text-sm font-medium text-[#f5f5f5]">{name}</span>
                  <SeverityBadge severity={severity} />
                  <span className="text-xs text-[#6b7280] font-mono w-20 text-right">{daysOpen} days open</span>
                  <span className="text-xs text-[#9ca3af] font-mono w-16 text-right">↑ {votes}</span>
                </a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
