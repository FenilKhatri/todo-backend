import { z } from "zod";

export const userNameSchema = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters long.")
  .max(12, "Name must be at most 12 characters long.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email must be valid.");

export const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters long.")
  .max(25, "Password must be at most 25 characters long.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
  );

// Signup schema
export const signupSchema = z.object({
  userName: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required!"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});