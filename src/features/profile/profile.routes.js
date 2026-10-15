import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { uploadImage } from "../../shared/middleware/upload-image.js";
import {
  createChangeRequest,
  getProfile,
  removeAvatar,
  resendChangeOtp,
  updateProfile,
  uploadAvatar,
  verifyChange,
} from "./profile.controller.js";
import { changeRequestSchema, updateProfileSchema } from "./profile.validation.js";
import { verifyOtpSchema } from "../../shared/otp/otp.validation.js";

const profileRoutes = Router();

profileRoutes.get("/", getProfile);
profileRoutes.patch("/", validate(updateProfileSchema), updateProfile);
profileRoutes.put("/avatar", uploadImage("avatar"), uploadAvatar);
profileRoutes.delete("/avatar", removeAvatar);
profileRoutes.post("/change-requests", validate(changeRequestSchema), createChangeRequest);
profileRoutes.post("/change-requests/:requestId/resend", resendChangeOtp);
profileRoutes.post("/change-requests/:requestId/verify", validate(verifyOtpSchema), verifyChange);

export default profileRoutes;
