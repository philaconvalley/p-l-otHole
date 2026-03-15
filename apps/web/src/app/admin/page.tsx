import { SeverityBadge } from "@/components/severity-badge";

const FLAGGED_REPORTS = [
  { name: '"Big Bobs Bump"',     address: "1400 Mifflin St",    reporter: "@dan_r",    reason: "DUPLICATE",          reasonCls: "bg-amber-600/15 text-amber-400 border-amber-600/30",   flaggedBy: "3 users",  date: "Apr 1" },
  { name: '"The Eternal Pit"',   address: "982 Tasker St",      reporter: "@ghost98",  reason: "SPAM",               reasonCls: "bg-red-500/15 text-red-400 border-red-500/30",          flaggedBy: "Auto-flag",date: "Apr 2" },
  { name: '"Pothole Paradise"',  address: "201 W Oregon Ave",   reporter: "@civic_cam",reason: "FALSE REPORT",       reasonCls: "bg-[#2a2a2a] text-[#9ca3af] border-[#444]",             flaggedBy: "1 user",   date: "Apr 3" },
  { name: '"Big Nasty 87"',      address: "1600 Pattison Ave",  reporter: "@moreal",   reason: "INAPPROPRIATE NAME", reasonCls: "bg-blue-600/15 text-blue-400 border-blue-600/30",        flaggedBy: "2 users",  date: "Apr 4" },
];

const SIDEBAR_NAV = [
  { icon: "🚩", label: "Flagged Reports",  badge: 12, active: true  },
  { icon: "⇌",  label: "Merge Duplicates", badge:  4, active: false },
  { icon: "👤", label: "User Management",  badge:  0, active: false },
  { icon: "📊", label: "Stats",            badge:  0, active: false },
  { icon: "⚙️", label: "Settings",         badge:  0, active: false },
];

const FILTER_TABS = ["All", "Spam", "Duplicate", "Inappropriate", "False report"];

export default function AdminPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#171717] flex">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 bg-[#1e1e1e] border-r border-[#2a2a2a] p-3">
        <div className="space-y-1">
          {SIDEBAR_NAV.map(({ icon, label, badge, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                          transition-colors text-left
                          ${active
                            ? "bg-[#e5521e]/15 text-[#e5521e] border border-[#e5521e]/20"
                            : "text-[#9ca3af] hover:bg-[#2a2a2a] hover:text-white"}`}
            >
              <span className="text-base">{icon}</span>
              <span className="flex-1 font-medium">{label}</span>
              {badge > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                  ${active ? "bg-[#e5521e] text-white" : "bg-[#333] text-[#9ca3af]"}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────── */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#f5f5f5] mb-4">Flagged reports</h1>
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map((tab, i) => (
              <button
                key={tab}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                  ${i === 0
                    ? "bg-[#e5521e] text-white border-[#e5521e]"
                    : "text-[#9ca3af] border-[#444] hover:border-[#888] hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#222] border border-[#333] rounded-xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3
                          bg-[#1e1e1e] border-b border-[#333]">
            {["REPORT", "REPORTER", "FLAG REASON", "FLAGGED BY", "DATE", "ACTIONS"].map((h) => (
              <span key={h} className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#2a2a2a]">
            {FLAGGED_REPORTS.map(({ name, address, reporter, reason, reasonCls, flaggedBy, date }) => (
              <div
                key={name}
                className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-4
                           hover:bg-[#2a2a2a] transition-colors items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#f5f5f5]">{name}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">{address}</p>
                </div>
                <span className="text-sm text-[#9ca3af]">{reporter}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold
                                  uppercase tracking-wide border w-fit ${reasonCls}`}>
                  {reason}
                </span>
                <span className="text-xs text-[#9ca3af]">{flaggedBy}</span>
                <span className="text-xs text-[#6b7280]">{date}</span>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-[#9ca3af] hover:text-white px-2 py-1 rounded bg-[#2a2a2a] hover:bg-[#333]">
                    Dismiss
                  </button>
                  <button className="text-xs text-[#ef4444] hover:text-red-300 px-2 py-1 rounded bg-red-950/30 hover:bg-red-950/50">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
