import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(3, "Board name must be at least 3 characters long.")
  .max(40, "Board name must be at most 40 characters long.");

const descriptionSchema = z
  .string()
  .trim()
  .max(200, "Description must be at most 200 characters long.");

export const createBoardSchema = z.object({
  name: nameSchema,
  description: descriptionSchema.optional().default(""),
});

export const updateBoardSchema = z
  .object({
    name: nameSchema.optional(),
    description: descriptionSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "No changes were provided.");

export const shareBoardSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email must be valid."),
});
