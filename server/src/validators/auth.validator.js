import { z } from "zod";

export const loginUserSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required")
        .max(72, "Password must not exceed 72 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters").max(72, "Password must not exceed 72 characters"),
});