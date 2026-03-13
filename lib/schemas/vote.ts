import { z } from "zod";

// Create/update vote request body
export const createVoteSchema = z.object({
  value: z
    .number()
    .int("Value must be an integer")
    .min(1, "Value must be between 1 and 5")
    .max(5, "Value must be between 1 and 5"),
  note: z
    .string()
    .max(280, "Note must be 280 characters or less")
    .optional(),
});

export type CreateVoteInput = z.infer<typeof createVoteSchema>;
