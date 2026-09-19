import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),

  unitId: z
    .string()
    .uuid("Invalid organization unit ID")
    .optional(),

  roleId: z
    .string()
    .uuid("Invalid role ID")
    .optional(),
});

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .optional(),

    password: z
      .string()
      .min(8)
      .max(100)
      .optional(),

    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const assignRoleSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),

  unitId: z
    .string()
    .uuid("Invalid organization unit ID")
    .optional(),

  scope: z
    .enum([
      "ORGANIZATION",
      "OWN_UNIT",
      "UNIT_AND_DESCENDANTS",
      "ASSIGNED_CASES",
      "EXPLICIT_CASES",
    ])
    .default("OWN_UNIT"),
});

export const updateUserRoleScopeSchema = z.object({
  scope: z.enum([
    "ORGANIZATION",
    "OWN_UNIT",
    "UNIT_AND_DESCENDANTS",
    "ASSIGNED_CASES",
    "EXPLICIT_CASES",
  ]),
});