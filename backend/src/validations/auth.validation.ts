import { z } from "zod";

// Validation happens before the request reaches the controller

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email")
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email")
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password is required"),
});


// Infer TypeScript types directly from Zod schemas
// This means one schema drives both runtime validation AND types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;