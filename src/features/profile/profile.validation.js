import { z } from "zod";
import { emailSchema, passwordSchema, userNameSchema } from "../auth/auth.validation.js";
import { IMAGE_TYPES, MAX_IMAGE_SIZE } from "../../shared/middleware/upload-image.js";

export const avatarFileSchema = z.object(
  {
    mimetype: z.enum(IMAGE_TYPES, { message: "Only JPG, PNG, WEBP or GIF images are allowed." }),
    size: z
      .number()
      .positive("The image is empty.")
      .lt(MAX_IMAGE_SIZE, "Image must be smaller than 5 MB."),
    buffer: z.instanceof(Buffer),
  },
  { message: "Please choose an image to upload." },
);

export const updateProfileSchema = z.object({
  userName: userNameSchema,
});

const changeEmailSchema = z.object({
  type: z.literal("email"),
  email: emailSchema,
});

const changePasswordSchema = z
  .object({
    type: z.literal("password"),
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password.",
    path: ["newPassword"],
  });

export const changeRequestSchema = z.discriminatedUnion("type", [changeEmailSchema, changePasswordSchema]);
