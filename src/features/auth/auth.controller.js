import asyncHandler from "../../shared/utils/asynch-handler.js";
import {
  forgotPasswordService,
  loginUserService,
  registerUserService,
  REMEMBER_ME_DAYS,
  resendResetOtpService,
  resetPasswordService,
  verifyResetOtpService,
} from "./auth.service.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

export const registerUser = asyncHandler(async (req, res) => {
  const result = await registerUserService(req.validatedBody);

  res.cookie("token", result.token, cookieOptions);

  return res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: result.user,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { rememberMe } = req.validatedBody;
  const result = await loginUserService(req.validatedBody);

  // Without "remember me" the cookie is a session cookie, cleared when the browser closes.
  const { maxAge, ...sessionCookie } = cookieOptions;
  res.cookie(
    "token",
    result.token,
    rememberMe ? { ...cookieOptions, maxAge: REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000 } : sessionCookie,
  );

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: result.user,
  });
});

export const getCurrentUser = (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      userName: req.user.userName,
      email: req.user.email,
      profilePicture: req.user.profilePicture,
    },
  });
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = asyncHandler(async (req, res) => {
  const challenge = await forgotPasswordService(req.validatedBody);
  res.status(201).json({ success: true, message: "Verification code sent", challenge });
});

export const resendResetOtp = asyncHandler(async (req, res) => {
  const challenge = await resendResetOtpService(req.params.requestId);
  res.status(200).json({ success: true, message: "A new verification code was sent", challenge });
});

export const verifyResetOtp = asyncHandler(async (req, res) => {
  const result = await verifyResetOtpService(req.params.requestId, req.validatedBody.otp);
  res.status(200).json({ success: true, message: "Code verified", ...result });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordService(req.params.requestId, req.validatedBody);
  res.status(200).json({ success: true, message: "Password reset successfully" });
});
