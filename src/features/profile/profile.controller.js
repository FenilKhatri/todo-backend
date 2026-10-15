import asyncHandler from "../../shared/utils/asynch-handler.js";
import {
  createChangeRequestService,
  getProfileService,
  removeAvatarService,
  resendChangeOtpService,
  updateProfileService,
  uploadAvatarService,
  verifyChangeService,
} from "./profile.service.js";
import { avatarFileSchema } from "./profile.validation.js";

export const uploadAvatar = asyncHandler(async (req, res) => {
  const result = avatarFileSchema.safeParse(req.file);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "avatar",
        message: issue.message,
      })),
    });
  }

  const user = await uploadAvatarService(req.user._id, result.data);
  res.status(200).json({ success: true, message: "Profile image updated", user });
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const user = await removeAvatarService(req.user._id);
  res.status(200).json({ success: true, message: "Profile image removed", user });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getProfileService(req.user._id);
  res.status(200).json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateProfileService(req.user._id, req.validatedBody);
  res.status(200).json({ success: true, message: "Profile updated successfully", user });
});

export const createChangeRequest = asyncHandler(async (req, res) => {
  const challenge = await createChangeRequestService(req.user._id, req.validatedBody);
  res.status(201).json({ success: true, message: "Verification code sent", challenge });
});

export const resendChangeOtp = asyncHandler(async (req, res) => {
  const challenge = await resendChangeOtpService(req.user._id, req.params.requestId);
  res.status(200).json({ success: true, message: "A new verification code was sent", challenge });
});

export const verifyChange = asyncHandler(async (req, res) => {
  const result = await verifyChangeService(
    req.user._id,
    req.params.requestId,
    req.validatedBody.otp,
  );
  res.status(200).json({
    success: true,
    message: result.type === "email" ? "Email changed successfully" : "Password changed successfully",
    ...result,
  });
});
