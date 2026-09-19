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