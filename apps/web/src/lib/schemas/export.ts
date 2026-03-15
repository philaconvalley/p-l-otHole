import { z } from "zod";
import { hazardTypeSchema, repairStatusSchema } from "./hazard";

// Export query params (shared between GeoJSON and CSV)
export const exportQuerySchema = z.object({
  city: z.string().optional(),
  updatedSince: z
    .string()
    .datetime({ message: "updatedSince must be a valid ISO 8601 date" })
    .optional(),
  type: hazardTypeSchema.optional(),
  repairStatus: repairStatusSchema.optional(),
});

export type ExportQuery = z.infer<typeof exportQuerySchema>;
