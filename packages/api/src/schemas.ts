import { z } from "zod";

// ── Enums ──────────────────────────────────────────────────────────────────

export const HazardType = z.enum([
  "pothole",
  "crack",
  "sinkhole",
  "drainage",
  "debris",
]);

export const RepairStatus = z.enum([
  "reported",
  "acknowledged",
  "scheduled",
  "in_progress",
  "resolved",
  "disputed",
]);

export const SortOrder = z.enum(["newest", "oldest", "severity", "most_voted"]);

// ── Hazards ────────────────────────────────────────────────────────────────

export const CreateHazardSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1),
  type: HazardType,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  images: z.array(z.string().url()).optional().default([]),
});

export const UpdateHazardSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().min(1).optional(),
  type: HazardType.optional(),
  repairStatus: RepairStatus.optional(),
  cityTicketId: z.string().max(80).optional(),
});

export const ListHazardsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(),
  type: HazardType.optional(),
  repairStatus: RepairStatus.optional(),
  city: z.string().optional(),
  sort: SortOrder.default("newest"),
});

export const SearchHazardsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().int().min(1).max(10_000),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(),
  type: HazardType.optional(),
  repairStatus: RepairStatus.optional(),
});

// ── Votes ──────────────────────────────────────────────────────────────────

export const CastVoteSchema = z.object({
  value: z.number().int().min(1).max(5),
  note: z.string().max(280).optional(),
});

// ── Exports ────────────────────────────────────────────────────────────────

export const ExportQuerySchema = z.object({
  city: z.string().optional(),
  updatedSince: z.string().datetime().optional(),
  type: HazardType.optional(),
  repairStatus: RepairStatus.optional(),
});

// ── Inferred types ─────────────────────────────────────────────────────────

export type CreateHazard = z.infer<typeof CreateHazardSchema>;
export type UpdateHazard = z.infer<typeof UpdateHazardSchema>;
export type ListHazards = z.infer<typeof ListHazardsSchema>;
export type SearchHazards = z.infer<typeof SearchHazardsSchema>;
export type CastVote = z.infer<typeof CastVoteSchema>;
export type ExportQuery = z.infer<typeof ExportQuerySchema>;
