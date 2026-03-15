"use client";

import { useState } from "react";

interface Props {
  hazardId: string;
  currentName: string;
  upvotes: number;
}

export function NameProposal({ hazardId, currentName, upvotes }: Props) {
  const [name, setName]       = useState(currentName ?? "");
  const [display, setDisplay] = useState(currentName ?? "");
  const [status, setStatus]   = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [msg, setMsg]         = useState<string | null>(null);

  async function propose(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === display) return;
    setStatus("saving");
    setMsg(null);
    try {
      const res = await fetch(`/api/v1/hazards/${hazardId}/name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setDisplay(trimmed);
        setStatus("saved");
        setMsg("+5 rep — name updated!");
        setTimeout(() => setStatus("idle"), 3000);
      } else if (res.status === 401) {
        setMsg("Sign in to propose a name");
        setStatus("error");
      } else {
        setMsg("Could not update name");
        setStatus("error");
      }
    } catch {
      setMsg("Network error");
      setStatus("error");
    }
  }

  return (
    <div className="bg-[#222] border border-[#333] rounded-xl p-5">
      <p className="text-sm font-semibold text-[#f5f5f5] mb-1">Community name</p>
      <p className="text-base font-bold text-[#F99300] mb-1">&ldquo;{display}&rdquo;</p>
      <p className="text-xs text-[#6b7280] mb-3">{upvotes} votes</p>
      <form onSubmit={propose} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Propose a different name..."
          className="flex-1 text-sm"
          disabled={status === "saving"}
        />
        <button
          type="submit"
          disabled={status === "saving" || !name.trim() || name.trim() === display}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#F99300] rounded-lg
                     hover:bg-[#e07e00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "saving" ? "…" : "Save"}
        </button>
      </form>
      {msg && (
        <p className={`text-xs mt-2 ${status === "saved" ? "text-emerald-400" : "text-[#9ca3af]"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
