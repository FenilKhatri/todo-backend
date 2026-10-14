import { Router } from "express";
import { getDashboardSummary } from "./dashboardboard.controller.js";

const dashboardRoutes = Router();

dashboardRoutes.get("/", getDashboardSummary);

export default dashboardRoutes;
