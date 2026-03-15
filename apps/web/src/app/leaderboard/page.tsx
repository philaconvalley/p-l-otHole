import { SeverityBadge } from "@/components/severity-badge";

const TOP_REPORTERS = [
  { rank: 1,  username: "@mlampkin",   reports: 47, votes: 1420, rep: 3840, rank_label: "City Guardian",  medal: "🥇" },
  { rank: 2,  username: "@civic_cam",  reports: 38, votes:  980, rep: 2910, rank_label: "Civic Scout",    medal: "🥈" },
  { rank: 3,  username: "@dan_r",      reports: 31, votes:  874, rep: 2460, rank_label: "Civic Scout",    medal: "🥉" },
  { rank: 4,  username: "@roadwatch",  reports: 28, votes:  720, rep: 2100, rank_label: "Civic Scout",    medal: ""   },
  { rank: 5,  username: "@ghost98",    reports: 22, votes:  610, rep: 1750, rank_label: "Reporter",       medal: ""   },
  { rank: 6,  username: "@moreal",     reports: 19, votes:  540, rep: 1480, rank_label: "Reporter",       medal: ""   },
  { rank: 7,  username: "@streetwatch",reports: 17, votes:  490, rep: 1320, rank_label: "Reporter",       medal: ""   },
  { rank: 8,  username: "@jvincent",   reports: 15, votes:  420, rep: 1100, rank_label: "Reporter",       medal: ""   },
  { rank: 9,  username: "@northphilly",reports: 13, votes:  370, rep:  960, rank_label: "Reporter",       medal: ""   },
  { rank: 10, username: "@potwatch",   reports: 11, votes:  310, rep:  820, rank_label: "Newcomer",       medal: ""   },
];

const TOP_HAZARDS = [
  { rank: 1, slug: "the-abyss-on-5th",    name: "The Abyss on 5th",    severity: "critical" as const, votes: 218 },
  { rank: 2, slug: "kensington-krater",   name: "Kensington Krater",   severity: "critical" as const, votes: 187 },
  { rank: 3, slug: "lake-crater-broad",   name: "Lake Crater, Broad",  severity: "high"     as const, votes:  94 },
  { rank: 4, slug: "arch-st-sinkhole",    name: "Arch St Sinkhole",    severity: "high"     as const, votes:  77 },
  { rank: 5, slug: "sinky-mcsinkface",    name: "Sinky McSinkface",    severity: "moderate" as const, votes:  31 },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#171717] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#f5f5f5]">Leaderboard</h1>
          <div className="flex gap-2">
            {["This month", "All time"].map((t, i) => (
              <button key={t} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
                ${i === 0 ? "bg-[#e5521e] text-white border-[#e5521e]" : "text-[#9ca3af] border-[#444] hover:border-[#888]"}`}>
                {t}
              </button>
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
              {TOP_REPORTERS.map(({ rank, username, reports, votes, rep, rank_label, medal }) => (
                <div key={username} className="flex items-center gap-3 px-5 py-3 hover:bg-[#2a2a2a] transition-colors">
                  <span className="text-sm font-mono text-[#6b7280] w-6 flex-shrink-0">
                    {medal || rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <a href={`/profile/${username.replace("@", "")}`}
                       className="text-sm font-medium text-[#f5f5f5] hover:text-[#e5521e] transition-colors">
                      {username}
                    </a>
                    <p className="text-[10px] text-[#4b5563]">{rank_label}</p>
                  </div>
                  <span className="text-xs text-[#6b7280] font-mono w-14 text-right">{reports} rpts</span>
                  <span className="text-xs text-[#9ca3af] font-mono w-12 text-right">↑{votes}</span>
                  <span className="text-xs font-bold text-[#f5f5f5] font-mono w-14 text-right">{rep.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top voted hazards */}
          <div className="space-y-6">
            <div className="bg-[#222] border border-[#333] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#333]">
                <p className="text-sm font-semibold text-[#f5f5f5]">Most voted hazards</p>
                <p className="text-xs text-[#6b7280] mt-0.5">community pressure ranking</p>
              </div>
              <div className="divide-y divide-[#2a2a2a]">
                {TOP_HAZARDS.map(({ rank, slug, name, severity, votes }) => (
                  <a
                    key={slug}
                    href={`/hazard/${slug}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[#2a2a2a] transition-colors"
                  >
                    <span className="text-sm font-mono text-[#6b7280] w-5">{rank}</span>
                    <span className="flex-1 text-sm font-medium text-[#f5f5f5]">{name}</span>
                    <SeverityBadge severity={severity} />
                    <span className="text-xs text-[#9ca3af] font-mono w-12 text-right">↑ {votes}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* City rank card */}
            <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-5">
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest mb-3">Your city rank</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#e5521e]/15 border border-[#e5521e]/30
                                flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#e5521e]">#3</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#f5f5f5]">@dan_r</p>
                  <p className="text-xs text-[#9ca3af]">2,460 reputation · Civic Scout</p>
                  <p className="text-xs text-[#4b5563] mt-0.5">450 pts to City Guardian</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
