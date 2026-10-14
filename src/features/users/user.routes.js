import { Router } from "express";
import { searchUsers } from "./user.controller.js";

const userRoutes = Router();

userRoutes.get("/search", searchUsers);

export default userRoutes;
