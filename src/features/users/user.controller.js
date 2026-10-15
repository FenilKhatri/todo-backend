import asyncHandler from "../../shared/utils/asynch-handler.js";
import { searchUsersService } from "./user.service.js";

export const searchUsers = asyncHandler(async (req, res) => {
  const users = await searchUsersService(req.user._id, String(req.query.q || ""), req.query.boardId);
  res.status(200).json({ success: true, users });
});
