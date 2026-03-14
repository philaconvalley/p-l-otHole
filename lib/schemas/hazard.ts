import { z } from "zod";

// Hazard type enum matching Prisma
export const hazardTypeSchema = z.enum([
  "pothole",
  "crack",
  "sinkhole",
  "drainage",
  "debris",
]);

// Repair status enum matching Prisma
export const repairStatusSchema = z.enum([
  "reported",
  "acknowledged",
  "scheduled",
  "in_progress",
  "resolved",
  "disputed",
]);

// Create hazard request body
export const createHazardSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be 2000 characters or less"),
  type: hazardTypeSchema,
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .max(10, "Maximum 10 images allowed")
    .default([]),
  cityCode: z
    .string()
    .min(1)
    .max(32)
    .default("SF"),
});

// Update hazard request body (partial, owner/moderator only)
export const updateHazardSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(120)
    .optional(),
  description: z
    .string()
    .min(1)
    .max(2000)
    .optional(),
  type: hazardTypeSchema.optional(),
  repairStatus: repairStatusSchema.optional(),
  cityTicketId: z
    .string()
    .max(80)
    .nullable()
    .optional(),
});

// List hazards query params
export const listHazardsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .min(1)
    .max(100)
    .default(25),
  cursor: z.string().optional(),
  type: hazardTypeSchema.optional(),
  repairStatus: repairStatusSchema.optional(),
  city: z.string().optional(),
  sort: z
    .enum(["newest", "oldest", "severity", "most_voted"])
    .default("newest"),
});

// Search hazards query params (radius search)
export const searchHazardsQuerySchema = z.object({
  lat: z.coerce
    .number()
    .min(-90)
    .max(90),
  lng: z.coerce
    .number()
    .min(-180)
    .max(180),
  radiusMeters: z.coerce
    .number()
    .min(1)
    .max(10000),
  limit: z.coerce
    .number()
    .min(1)
    .max(100)
    .default(25),
  cursor: z.string().optional(),
  type: hazardTypeSchema.optional(),
  repairStatus: repairStatusSchema.optional(),
});

// Type exports
export type CreateHazardInput = z.infer<typeof createHazardSchema>;
export type UpdateHazardInput = z.infer<typeof updateHazardSchema>;
export type ListHazardsQuery = z.infer<typeof listHazardsQuerySchema>;
export type SearchHazardsQuery = z.infer<typeof searchHazardsQuerySchema>;
