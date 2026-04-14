export const dynamic = "force-dynamic";
import Link from "next/link";
import { SeverityBadge } from "@/components/severity-badge";
import { severityLabel } from "@/lib/format";
import { db } from "@/lib/db";

async function getData(period: "month" | "all") {
  const since = period === "month"
    ? new Date(Date.now() - 30 * 86_400_000)
    : undefined;

  const dateFilter = since ? { createdAt: { gte: since } } : {};

  const [users, topHazards] = await Promise.all([
    db.user.findMany({
      where: { isBanned: false, ...dateFilter },
      orderBy: { reputationScore: "desc" },
      take: 10,
      select: { id: true, username: true, reputationScore: true, reportsSubmitted: true, votesCast: true },
    }),
    db.hazard.findMany({
      where: { deletedAt: null, ...dateFilter },
      orderBy: { upvotes: "desc" },
      take: 5,
      select: { id: true, slug: true, name: true, upvotes: true, severityScore: true },
    }),
  ]);
  return { users, topHazards };
}

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_LABELS = ["City Guardian", "City Guardian", "Civic Scout", "Civic Scout", "Reporter", "Reporter", "Reporter", "Reporter", "Reporter", "Newcomer"];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = searchParams.period === "month" ? "month" : "all";
  const { users, topHazards } = await getData(period);

  return (
    <div className="min-h-viewport-minus-nav bg-[#171717] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#f5f5f5]">Leaderboard</h1>
          <div className="flex gap-2">
            {([["month", "This month"], ["all", "All time"]] as const).map(([val, label]) => (
              <Link key={val} href={`/leaderboard?period=${val}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
                  ${period === val
                    ? "bg-[#F99300] text-white border-[#F99300]"
                    : "text-[#9ca3af] border-[#444] hover:border-[#888]"}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top reporters */}
          <div className="bg-[#222] border border-[#333] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#333]">
              <p className="text-sm font-semibold text-[#f5f5f5]">Top reporters</p>
              <p className="text-xs text-[#6b7280] mt-0.5">by reputation score</p>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
              {users.map((user, i) => (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#2a2a2a] transition-colors">
                  <span className="text-sm font-mono text-[#6b7280] w-6 flex-shrink-0">
                    {MEDALS[i] ?? i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <a href={`/profile/${user.username}`}
                       className="text-sm font-medium text-[#f5f5f5] hover:text-[#F99300] transition-colors">
                      @{user.username}
                    </a>
                    <p className="text-[10px] text-[#4b5563]">{RANK_LABELS[i] ?? "Newcomer"}</p>
                  </div>
                  <span className="text-xs text-[#6b7280] font-mono w-14 text-right">{user.reportsSubmitted} rpts</span>
                  <span className="text-xs text-[#9ca3af] font-mono w-12 text-right">↑{user.votesCast}</span>
                  <span className="text-xs font-bold text-[#f5f5f5] font-mono w-14 text-right">{user.reputationScore.toLocaleString()}</span>
                </div>
              ))}
              {users.length === 0 && (
                <div className="px-5 py-6 text-center text-xs text-[#4b5563]">No users yet.</div>
              )}
            </div>
          </div>

          {/* Top voted hazards + city rank */}
          <div className="space-y-6">
            <div className="bg-[#222] border border-[#333] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#333]">
                <p className="text-sm font-semibold text-[#f5f5f5]">Most voted hazards</p>
                <p className="text-xs text-[#6b7280] mt-0.5">community pressure ranking</p>
              </div>
              <div className="divide-y divide-[#2a2a2a]">
                {topHazards.map((h, i) => (
                  <a key={h.id} href={`/hazard/${h.slug}`}
                     className="flex items-center gap-3 px-5 py-3 hover:bg-[#2a2a2a] transition-colors">
                    <span className="text-sm font-mono text-[#6b7280] w-5">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-[#f5f5f5]">{h.name}</span>
                    <SeverityBadge severity={severityLabel(h.severityScore, h.upvotes)} />
                    <span className="text-xs text-[#9ca3af] font-mono w-12 text-right">↑ {h.upvotes}</span>
                  </a>
                ))}
                {topHazards.length === 0 && (
                  <div className="px-5 py-6 text-center text-xs text-[#4b5563]">No hazards yet.</div>
                )}
              </div>
            </div>

            {users[0] && (
              <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-5">
                <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest mb-3">Top contributor</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F99300]/15 border border-[#F99300]/30
                                  flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#F99300]">#1</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#f5f5f5]">@{users[0].username}</p>
                    <p className="text-xs text-[#9ca3af]">{users[0].reputationScore.toLocaleString()} reputation · {RANK_LABELS[0]}</p>
                    <p className="text-xs text-[#4b5563] mt-0.5">{users[0].reportsSubmitted} reports · {users[0].votesCast} votes</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
