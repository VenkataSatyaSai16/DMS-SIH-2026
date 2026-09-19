import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Permission name must be at least 2 characters")
    .max(100),

  resource: z
    .string()
    .trim()
    .min(2, "Resource must be at least 2 characters")
    .max(100),

  action: z
    .string()
    .trim()
    .min(2, "Action must be at least 2 characters")
    .max(100),

  description: z.string().trim().max(500).optional(),
});

export const updatePermissionSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    resource: z.string().trim().min(2).max(100).optional(),

    action: z.string().trim().min(2).max(100).optional(),

    description: z.string().trim().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const assignPermissionSchema = z.object({
  permissionId: z.string().uuid("Invalid permission ID"),
});