import asyncHandler from "../../shared/utils/asynch-handler.js";
import {
  createBoardService,
  deleteBoardService,
  getBoardDetailsService,
  getBoardsService,
  leaveBoardService,
  removeBoardMemberService,
  shareBoardService,
  updateBoardService,
} from "./board.service.js";

export const createBoard = asyncHandler(async (req, res) => {
  const board = await createBoardService(req.user._id, req.validatedBody);

  res.status(201).json({
    success: true,
    message: "Board created successfully",
    board,
  });
});

export const getBoards = asyncHandler(async (req, res) => {
  const boards = await getBoardsService(req.user._id);
  res.status(200).json({ success: true, boards });
});

export const getBoard = asyncHandler(async (req, res) => {
  const board = await getBoardDetailsService(req.params.boardId, req.user._id);
  res.status(200).json({ success: true, board });
});

export const updateBoard = asyncHandler(async (req, res) => {
  const board = await updateBoardService(req.params.boardId, req.user._id, req.validatedBody);

  res.status(200).json({
    success: true,
    message: "Board updated successfully",
    board,
  });
});

export const deleteBoard = asyncHandler(async (req, res) => {
  await deleteBoardService(req.params.boardId, req.user._id);

  res.status(200).json({
    success: true,
    message: "Board deleted successfully",
  });
});

export const shareBoard = asyncHandler(async (req, res) => {
  const board = await shareBoardService(req.params.boardId, req.user._id, req.validatedBody.email);

  res.status(200).json({
    success: true,
    message: "Board shared successfully",
    board,
  });
});

export const leaveBoard = asyncHandler(async (req, res) => {
  await leaveBoardService(req.params.boardId, req.user._id);

  res.status(200).json({
    success: true,
    message: "You left the shared board",
  });
});

export const removeBoardMember = asyncHandler(async (req, res) => {
  const board = await removeBoardMemberService(
    req.params.boardId,
    req.user._id,
    req.params.memberId,
  );

  res.status(200).json({
    success: true,
    message: "Access removed successfully",
    board,
  });
});
