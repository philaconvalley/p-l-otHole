"use client";

import { useState } from "react";

export function VerifyButton({ hazardId }: { hazardId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg]       = useState<string | null>(null);

  async function verify() {
    if (status !== "idle") return;
    setStatus("loading");
    setMsg(null);
    try {
      const res = await fetch(`/api/v1/hazards/${hazardId}/verify`, { method: "POST" });
      if (res.ok) {
        setStatus("done");
        setMsg("+15 rep earned — thank you!");
      } else if (res.status === 401) {
        setMsg("Sign in to verify");
        setStatus("error");
      } else if (res.status === 409) {
        setMsg("Already verified by you");
        setStatus("done");
      } else if (res.status === 403) {
        setMsg("Cannot verify your own report");
        setStatus("error");
      } else {
        setMsg("Could not verify");
        setStatus("error");
      }
    } catch {
      setMsg("Network error");
      setStatus("error");
    }
  }

  return (
    <div className="bg-[#222] border border-[#333] rounded-xl p-5">
      <p className="text-sm font-semibold text-[#f5f5f5] mb-2">In-person verify</p>
      <p className="text-xs text-[#9ca3af] mb-4">
        Confirm this hazard exists at the pinned location. +15 pts.
      </p>
      <button
        onClick={verify}
        disabled={status === "loading" || status === "done"}
        className={`w-full py-2.5 text-sm font-semibold rounded-lg border transition-colors
          ${status === "done"
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 cursor-default"
            : "text-white bg-[#2a2a2a] border-[#444] hover:border-[#888] hover:bg-[#333] disabled:opacity-50"}`}
      >
        {status === "loading" ? "Verifying…"
          : status === "done" ? "✓ Verified"
          : "Mark as verified (+15 pts)"}
      </button>
      {msg && (
        <p className={`text-xs mt-2 ${status === "done" ? "text-emerald-400" : "text-[#9ca3af]"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
