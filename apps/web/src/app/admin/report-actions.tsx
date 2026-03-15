"use client";

import { useState } from "react";

export function ReportActions({ reportId }: { reportId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<string | null>(null);

  async function act(action: "verify" | "reject") {
    setStatus("loading");
    const res = await fetch(`/api/v1/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setStatus("done");
      setResult(action === "verify" ? "Verified" : "Rejected");
    } else {
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <span className={`text-xs font-medium ${result === "Verified" ? "text-emerald-400" : "text-red-400"}`}>
        ✓ {result}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act("verify")}
        disabled={status === "loading"}
        className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded
                   bg-emerald-950/30 hover:bg-emerald-950/50 disabled:opacity-50"
      >
        Verify
      </button>
      <button
        onClick={() => act("reject")}
        disabled={status === "loading"}
        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded
                   bg-red-950/30 hover:bg-red-950/50 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
