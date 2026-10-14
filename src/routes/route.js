import { Router } from "express";
import taskRoutes from "../features/tasks/task.routes.js";
import boardRoutes from "../features/boards/board.routes.js";
import dashboardRoutes from "../features/dashboard/dashboard.routes.js";
import profileRoutes from "../features/profile/profile.routes.js";
import authenticate from "../shared/middleware/authenticate.js";
import authRoutes from "../features/auth/auth.routes.js";
import userRoutes from "../features/users/user.routes.js";

const router = Router();

router.use("/auth", authRoutes);

// protected routes
router.use(authenticate);
router.use("/tasks", taskRoutes);
router.use("/boards", boardRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/profile", profileRoutes);
router.use("/users", userRoutes);

export default router;
