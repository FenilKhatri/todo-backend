import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import {
  createBoard,
  deleteBoard,
  getBoard,
  getBoards,
  leaveBoard,
  removeBoardMember,
  shareBoard,
  updateBoard,
} from "./board.controller.js";
import { createBoardSchema, shareBoardSchema, updateBoardSchema } from "./board.validation.js";

const boardRoutes = Router();

boardRoutes.get("/", getBoards);
boardRoutes.post("/", validate(createBoardSchema), createBoard);
boardRoutes.get("/:boardId", getBoard);
boardRoutes.patch("/:boardId", validate(updateBoardSchema), updateBoard);
boardRoutes.delete("/:boardId/leave", leaveBoard);
boardRoutes.delete("/:boardId", deleteBoard);
boardRoutes.post("/:boardId/members", validate(shareBoardSchema), shareBoard);
boardRoutes.delete("/:boardId/members/:memberId", removeBoardMember);

export default boardRoutes;
