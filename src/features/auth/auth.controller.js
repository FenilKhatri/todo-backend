import asyncHandler from "../../shared/utils/asynch-handler.js";
import { registerUserService, loginUserService } from "./auth.service.js";

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
  const result = await loginUserService(req.validatedBody);

  res.cookie("token", result.token, cookieOptions);

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
