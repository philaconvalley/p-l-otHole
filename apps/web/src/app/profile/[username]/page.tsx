export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { SeverityBadge } from "@/components/severity-badge";
import { severityLabel, daysAgo } from "@/lib/format";

function repTier(rep: number): { label: string; next: number | null; nextLabel: string | null; pct: number } {
  if (rep >= 2500) return { label: "Urban Legend",      next: null, nextLabel: null,           pct: 100 };
  if (rep >= 1000) return { label: "City Guardian",     next: 2500, nextLabel: "Urban Legend",  pct: Math.round(((rep - 1000) / 1500) * 100) };
  if (rep >= 500)  return { label: "Road Warrior",      next: 1000, nextLabel: "City Guardian", pct: Math.round(((rep - 500)  /  500) * 100) };
  if (rep >= 100)  return { label: "Civic Scout",       next: 500,  nextLabel: "Road Warrior",  pct: Math.round(((rep - 100)  /  400) * 100) };
  return           { label: "Concerned Citizen",        next: 100,  nextLabel: "Civic Scout",   pct: Math.round((rep / 100) * 100) };
}

interface BadgeStats { reports: number; votes: number; verifications: number; rep: number }

const BADGE_DEFS = [
  { icon: "🔭", label: "First Report",   check: (s: BadgeStats) => s.reports >= 1   },
  { icon: "🗳️", label: "100 Votes",      check: (s: BadgeStats) => s.votes >= 100   },
  { icon: "🏅", label: "Verified Scout", check: (s: BadgeStats) => s.verifications >= 1 },
  { icon: "🔥", label: "10 Reports",     check: (s: BadgeStats) => s.reports >= 10  },
  { icon: "🌆", label: "City Mapper",    check: (s: BadgeStats) => s.reports >= 25  },
  { icon: "⚡", label: "Speed Reporter", check: (s: BadgeStats) => s.reports >= 5   },
  { icon: "🏆", label: "Top 10 City",    check: (s: BadgeStats) => s.rep >= 1000    },
  { icon: "🌟", label: "Legend",         check: (s: BadgeStats) => s.rep >= 2500    },
];

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await db.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      username: true,
      reputationScore: true,
      reportsSubmitted: true,
      votesCast: true,
      isModerator: true,
      createdAt: true,
      hazards: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true, slug: true, name: true,
          severityScore: true, upvotes: true, createdAt: true,
        },
      },
    },
  });

  if (!user) notFound();

  // Count in-person verifications (votes with value=0 cast by this user)
  const verifications = await db.vote.count({
    where: { userId: user.id, value: 0 },
  });

  const rep   = user.reputationScore;
  const tier  = repTier(rep);
  const stats: BadgeStats = {
    reports:       user.reportsSubmitted,
    votes:         user.votesCast,
    verifications,
    rep,
  };

  const badges = BADGE_DEFS.map(b => ({ ...b, earned: b.check(stats) }));

  const displayName = user.username.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const initials    = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

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
            <p className="text-xs text-[#6b7280] mt-0.5">@{user.username}</p>
            {user.isModerator && (
              <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold
                               bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Moderator
              </span>
            )}
            <p className="text-xs text-[#9ca3af] mt-2 flex items-center gap-1">
              <span>📍</span> Philadelphia, PA
            </p>
            <p className="text-[10px] text-[#4b5563] mt-1">
              Member since {user.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </div>

          {/* Rank + rep */}
          <div className="bg-[#222] border border-[#333] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6b7280] uppercase tracking-widest font-semibold">Rank</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F99300]/15 text-[#F99300] border border-[#F99300]/30">
                {tier.label}
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#9ca3af]">Reputation</span>
                <span className="text-xs font-mono text-[#f5f5f5]">
                  {rep.toLocaleString()}{tier.next ? ` / ${tier.next.toLocaleString()}` : ""}
                </span>
              </div>
              <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-[#F99300] rounded-full transition-all" style={{ width: `${tier.pct}%` }} />
              </div>
              {tier.nextLabel && (
                <p className="text-[10px] text-[#4b5563] mt-1">
                  {tier.next! - rep} pts to {tier.nextLabel}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#222] border border-[#333] rounded-xl p-4">
            <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-3">Stats</p>
            <div className="space-y-2.5">
              {[
                { label: "Reports filed",  value: user.reportsSubmitted },
                { label: "Votes cast",     value: user.votesCast        },
                { label: "Verified spots", value: verifications         },
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
              {badges.map(({ icon, label, earned }) => (
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
            {user.hazards.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-[#4b5563]">No reports yet.</div>
            ) : (
              <div className="divide-y divide-[#2a2a2a]">
                {user.hazards.map(h => (
                  <Link
                    key={h.id}
                    href={`/hazard/${h.slug ?? h.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[#2a2a2a] transition-colors"
                  >
                    <span className="flex-1 text-sm font-medium text-[#f5f5f5] truncate">
                      {h.name ?? "Unnamed hazard"}
                    </span>
                    <SeverityBadge severity={severityLabel(h.severityScore, h.upvotes)} />
                    <span className="text-xs text-[#6b7280] font-mono w-20 text-right">
                      {daysAgo(h.createdAt.toISOString())} days ago
                    </span>
                    <span className="text-xs text-[#9ca3af] font-mono w-16 text-right">↑ {h.upvotes}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
