import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { sensitiveLimiter } from "../../shared/middleware/rate-limit.js";
import { verifyOtpSchema } from "../../shared/otp/otp.validation.js";
import {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resendResetOtp,
  resetPassword,
  verifyResetOtp,
} from "./auth.controller.js";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from "./auth.validation.js";
import authenticate from "../../shared/middleware/authenticate.js";

const authRoutes = Router();

authRoutes.post("/register", validate(signupSchema), registerUser);
authRoutes.post("/login", validate(loginSchema), loginUser);
authRoutes.get("/me", authenticate, getCurrentUser);
authRoutes.post("/logout", authenticate, logoutUser);

// Forgot password: email -> OTP -> new password.
authRoutes.post("/forgot-password", sensitiveLimiter, validate(forgotPasswordSchema), forgotPassword);
authRoutes.post("/forgot-password/:requestId/resend", sensitiveLimiter, resendResetOtp);
authRoutes.post("/forgot-password/:requestId/verify", sensitiveLimiter, validate(verifyOtpSchema), verifyResetOtp);
authRoutes.post("/forgot-password/:requestId/reset", sensitiveLimiter, validate(resetPasswordSchema), resetPassword);

export default authRoutes;
