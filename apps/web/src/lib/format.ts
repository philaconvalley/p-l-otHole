/** Converts a numeric severity score to a display label. */
export function severityLabel(
  score: number,
  upvotes = 0,
): "critical" | "high" | "moderate" | "low" {
  const s = score ?? 0;
  const u = upvotes ?? 0;
  if (s >= 60 || u >= 100) return "critical";
  if (s >= 30 || u >= 40)  return "high";
  if (s >= 8  || u >= 8)   return "moderate";
  return "low";
}

/** Maps a Prisma repairStatus enum value to a human-readable label. */
export function statusLabel(raw: string): string {
  const map: Record<string, string> = {
    reported:     "Reported",
    acknowledged: "Acknowledged",
    scheduled:    "Scheduled",
    in_progress:  "In Progress",
    resolved:     "Resolved",
    disputed:     "Disputed",
  };
  return map[raw] ?? raw;
}

/** Maps a Prisma hazard type enum value to a human-readable label. */
export function typeLabel(raw: string): string {
  const map: Record<string, string> = {
    pothole:  "Pothole",
    crack:    "Crack",
    sinkhole: "Cave-in",
    drainage: "Drainage",
    debris:   "Debris",
  };
  return map[raw] ?? raw;
}

/** Returns days since a date. */
export function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}
