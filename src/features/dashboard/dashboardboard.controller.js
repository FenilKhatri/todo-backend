import asyncHandler from "../../shared/utils/asynch-handler.js";
import { getDashboardSummaryService } from "./dashboard.service.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummaryService(req.user._id);

  res.status(200).json({
    success: true,
    summary,
  });
});
