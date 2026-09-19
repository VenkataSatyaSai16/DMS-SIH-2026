import { z } from "zod";

export const createCaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200),

  description: z
    .string()
    .trim()
    .max(2000)
    .optional(),

  caseType: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .default("CRIMINAL"),

  status: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .default("ACTIVE"),

  priority: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .default("NORMAL"),

  unitId: z
    .string()
    .uuid("Invalid organization unit ID")
    .optional(),

  organizationUnitId: z
    .string()
    .uuid("Invalid organization unit ID")
    .optional(),
}).transform((data) => ({
  ...data,
  status: data.status || "ACTIVE",
  priority: data.priority || "NORMAL",
  caseType: data.caseType || "CRIMINAL",
  unitId: data.unitId || data.organizationUnitId,
}));

export const updateCaseSchema = z
  .object({
    title: z.string().trim().min(2).max(200).optional(),

    description: z.string().trim().max(2000).optional(),

    caseType: z.string().trim().min(2).max(50).optional(),

    status: z.string().trim().min(2).max(50).optional(),

    priority: z.string().trim().min(2).max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const assignCaseUnitSchema = z.object({
  unitId: z.string().uuid("Invalid organization unit ID"),
});

export const assignCaseUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export const grantCaseAccessSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),

  expiresAt: z
    .string()
    .datetime("Invalid expiration date")
    .optional(),
});