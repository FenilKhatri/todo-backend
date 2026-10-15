import crypto from "crypto";
import OtpRequest from "./otp.model.js";
import { createError } from "../errors/custom-error.js";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 5 * 1000;

const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

export const hashSecret = (secret) => crypto.createHash("sha256").update(secret).digest("hex");

export const secretMatches = (secret, hash) =>
  Boolean(hash) && crypto.timingSafeEqual(Buffer.from(hashSecret(secret), "hex"), Buffer.from(hash, "hex"));

export const toChallenge = (request, otp, extra = {}) => ({
  requestId: request._id,
  type: request.type,
  otp,
  expiresAt: request.expiresAt,
  ...extra,
});

export const createOtpRequest = async ({ user, type, value = "" }) => {
  await OtpRequest.deleteMany({ user, type });
  const otp = generateOtp();
  const request = await OtpRequest.create({
    user,
    type,
    value,
    otpHash: hashSecret(otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  return { request, otp };
};

export const resendOtp = async (filter) => {
  const request = await OtpRequest.findOne({ ...filter, verifiedAt: null });
  if (!request) throw createError("This request no longer exists. Please start again.", 404);

  const waitMs = (request.sentAt ?? request.createdAt).getTime() + RESEND_COOLDOWN_MS - Date.now();
  if (waitMs > 0) {
    const seconds = Math.ceil(waitMs / 1000);
    throw createError(`Please wait ${seconds} second${seconds === 1 ? "" : "s"} before requesting a new code.`, 429);
  }

  const otp = generateOtp();
  request.otpHash = hashSecret(otp);
  request.attempts = 0;
  request.sentAt = new Date();
  request.expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await request.save();
  return { request, otp };
};

export const verifyOtp = async (filter, otp) => {
  const request = await OtpRequest.findOne({ ...filter, verifiedAt: null }).select("+otpHash +value");

  if (!request || request.expiresAt < new Date()) {
    throw createError("This code has expired. Please request a new one.", 410);
  }
  if (request.attempts >= MAX_ATTEMPTS) {
    throw createError("Too many incorrect attempts. Please request a new code.", 429);
  }

  if (!secretMatches(otp, request.otpHash)) {
    request.attempts += 1;
    await request.save();
    const left = MAX_ATTEMPTS - request.attempts;
    throw createError(
      left > 0
        ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.`
        : "Too many incorrect attempts. Please request a new code.",
      400,
    );
  }

  return request;
};
