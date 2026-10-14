import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "./auth.controller.js";
import { signupSchema, loginSchema } from "./auth.validation.js";
import authenticate from "../../shared/middleware/authenticate.js";

const authRoutes = Router();

authRoutes.post("/register", validate(signupSchema), registerUser);
authRoutes.post("/login", validate(loginSchema), loginUser);
authRoutes.get("/me", authenticate, getCurrentUser);
authRoutes.post("/logout", authenticate, logoutUser);

export default authRoutes;
