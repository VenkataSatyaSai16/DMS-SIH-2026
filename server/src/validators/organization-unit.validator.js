import { z } from "zod";

export const createOrganizationUnitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Unit name must be at least 2 characters")
    .max(100),

  code: z
    .string()
    .trim()
    .min(2, "Unit code must be at least 2 characters")
    .max(30),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  parentUnitId: z
    .string()
    .uuid("Invalid parent unit ID")
    .optional(),
});

export const updateOrganizationUnitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    code: z
      .string()
      .trim()
      .min(2)
      .max(30)
      .optional(),

    description: z
      .string()
      .trim()
      .max(500)
      .optional(),

    parentUnitId: z
      .string()
      .uuid("Invalid parent unit ID")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });