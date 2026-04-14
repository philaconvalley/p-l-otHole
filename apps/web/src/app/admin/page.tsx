export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { ReportActions } from "./report-actions";

const SIDEBAR_NAV = [
  { icon: "🚩", label: "Flagged Reports", active: true },
  { icon: "👤", label: "User Management", active: false },
  { icon: "⚙️", label: "Settings",        active: false },
];

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isModerator) redirect("/");

  const pending = await db.report.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      hazard: { select: { id: true, name: true, slug: true, cityCode: true } },
      reporter: { select: { username: true } },
    },
  });

  const pendingCount = pending.length;

  return (
    <div className="min-h-viewport-minus-nav bg-[#171717] flex">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 bg-[#1e1e1e] border-r border-[#2a2a2a] p-3">
        <div className="space-y-1">
          {SIDEBAR_NAV.map(({ icon, label, active }) => (
            <div
              key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                          ${active
                            ? "bg-[#F99300]/15 text-[#F99300] border border-[#F99300]/20"
                            : "text-[#9ca3af]"}`}
            >
              <span className="text-base">{icon}</span>
              <span className="flex-1 font-medium">{label}</span>
              {active && pendingCount > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center bg-[#F99300] text-white">
                  {pendingCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────── */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#f5f5f5]">Pending reports</h1>
          <p className="text-sm text-[#6b7280] mt-1">{pendingCount} awaiting review</p>
        </div>

        <div className="bg-[#222] border border-[#333] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3
                          bg-[#1e1e1e] border-b border-[#333]">
            {["REPORT", "REPORTER", "DATE", "ACTIONS"].map(h => (
              <span key={h} className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest">
                {h}
              </span>
            ))}
          </div>

          <div className="divide-y divide-[#2a2a2a]">
            {pending.length === 0 && (
              <div className="px-5 py-8 text-center text-xs text-[#4b5563]">
                No pending reports — queue is clear.
              </div>
            )}
            {pending.map(r => (
              <div
                key={r.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-4
                           hover:bg-[#2a2a2a] transition-colors items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#f5f5f5]">
                    {r.hazard.name ?? "Unnamed hazard"}
                  </p>
                  <p className="text-xs text-[#6b7280] mt-0.5 truncate max-w-xs">
                    {r.description.slice(0, 80)}{r.description.length > 80 ? "…" : ""}
                  </p>
                  <a
                    href={`/hazard/${r.hazard.slug ?? r.hazard.id}`}
                    className="text-[10px] text-[#F99300] hover:underline mt-0.5 inline-block"
                  >
                    View hazard →
                  </a>
                </div>
                <span className="text-sm text-[#9ca3af]">
                  {r.reporter ? `@${r.reporter.username}` : "Anonymous"}
                </span>
                <span className="text-xs text-[#6b7280]">
                  {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <ReportActions reportId={r.id} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
