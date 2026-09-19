import { z } from "zod";

export const createAccessRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Reason must be at least 5 characters")
    .max(1000, "Reason must not exceed 1000 characters"),
});

export const reviewAccessRequestSchema = z.object({
  approve: z.boolean(),
});