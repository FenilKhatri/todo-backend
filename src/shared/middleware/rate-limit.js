import { rateLimit } from "express-rate-limit";

// Caps unauthenticated, abuse-prone endpoints (e.g. password reset) per IP.
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});
