import crypto from "crypto";
import bcrypt from "bcryptjs";
import OtpRequest from "../../shared/otp/otp.model.js";
import {
  createOtpRequest,
  hashSecret,
  resendOtp,
  secretMatches,
  toChallenge,
  verifyOtp,
} from "../../shared/otp/otp.service.js";
import User from "./auth.model.js";
import { createError } from "../../shared/errors/custom-error.js";
import generateToken from "../../shared/utils/generate-token.js";

export const registerUserService = async ({ userName, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    userName,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      profilePicture: user.profilePicture,
    },
    token,
  };
};

export const REMEMBER_ME_DAYS = 30;

export const loginUserService = async ({ email, password, rememberMe }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError("Invalid email or password", 401);
  }

  const token = generateToken(user._id, rememberMe ? `${REMEMBER_ME_DAYS}d` : "1d");

  return {
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      profilePicture: user.profilePicture,
    },
    token,
  };
};

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

// Step 1: the email must belong to an account; a code is issued for it.
export const forgotPasswordService = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw createError("No account found with this email address.", 404);

  const { request, otp } = await createOtpRequest({ user: user._id, type: "reset" });
  return toChallenge(request, otp, { email: user.email });
};

export const resendResetOtpService = async (requestId) => {
  const { request, otp } = await resendOtp({ _id: requestId, type: "reset" });
  return toChallenge(request, otp);
};

// Step 2: a correct code is exchanged for a short-lived reset token.
export const verifyResetOtpService = async (requestId, otp) => {
  const request = await verifyOtp({ _id: requestId, type: "reset" }, otp);

  const resetToken = crypto.randomBytes(32).toString("hex");
  request.value = hashSecret(resetToken);
  request.verifiedAt = new Date();
  request.expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await request.save();

  return { resetToken, expiresAt: request.expiresAt };
};

// Step 3: the reset token authorises setting a new password once.
export const resetPasswordService = async (requestId, { resetToken, password }) => {
  const request = await OtpRequest.findOne({ _id: requestId, type: "reset" }).select("+value");
  const valid =
    request?.verifiedAt && request.expiresAt > new Date() && secretMatches(resetToken, request.value);
  if (!valid) throw createError("This reset session has expired. Please start again.", 400);

  const user = await User.findById(request.user).select("+password");
  if (!user) throw createError("User not found", 404);
  if (await bcrypt.compare(password, user.password)) {
    throw createError("New password must be different from your old password.", 400);
  }

  user.password = await bcrypt.hash(password, 12);
  await user.save();
  await request.deleteOne();
};
