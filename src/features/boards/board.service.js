import Board from "./board.model.js";
import Task from "../tasks/task.model.js";
import User from "../auth/auth.model.js";
import { getBoardTasksService } from "../tasks/task.service.js";
import { createError } from "../../shared/errors/custom-error.js";

const boardQuery = () =>
  Board.find()
    .populate("owner", "userName email profilePicture")
    .populate("members.user", "userName email profilePicture");

const sameId = (left, right) => String(left) === String(right);

export const getBoardAccess = async (boardId, userId) => {
  const board = await boardQuery().findById(boardId);
  if (!board) throw createError("Board not found", 404);

  const isOwner = sameId(board.owner._id, userId);
  const isMember = board.members.some((member) => sameId(member.user?._id, userId));

  if (!isOwner && !isMember) throw createError("You do not have access to this board", 403);

  return { board, canEdit: isOwner };
};

export const createBoardService = async (ownerId, boardData) => {
  const board = await Board.create({ ...boardData, owner: ownerId });
  return boardQuery().findById(board._id);
};

export const getBoardsService = async (userId) => {
  const boards = await boardQuery()
    .find({
      $or: [{ owner: userId }, { "members.user": userId }],
    })
    .sort({ updatedAt: -1 });

  const counts = await Task.aggregate([
    { $match: { board: { $in: boards.map((board) => board._id) } } },
    { $group: { _id: "$board", count: { $sum: 1 } } },
  ]);
  const countByBoard = new Map(counts.map((item) => [String(item._id), item.count]));

  return boards.map((board) => ({
    ...board.toObject(),
    taskCount: countByBoard.get(String(board._id)) || 0,
    canEdit: sameId(board.owner._id, userId),
  }));
};

export const getBoardDetailsService = async (boardId, userId) => {
  const { board, canEdit } = await getBoardAccess(boardId, userId);
  const tasks = await getBoardTasksService(board._id);

  return {
    ...board.toObject(),
    canEdit,
    tasks,
  };
};

export const updateBoardService = async (boardId, userId, updates) => {
  const board = await Board.findOneAndUpdate({ _id: boardId, owner: userId }, updates, {
    new: true,
    runValidators: true,
  });

  if (!board) throw createError("Board not found", 404);
  return boardQuery().findById(board._id);
};

export const deleteBoardService = async (boardId, userId) => {
  const board = await Board.findOneAndDelete({ _id: boardId, owner: userId });
  if (!board) throw createError("Board not found", 404);

  await Task.updateMany({ board: board._id }, { board: null });
};

export const shareBoardService = async (boardId, userId, email) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) throw createError("Board not found", 404);

  const recipient = await User.findOne({ email }).select("userName email");
  if (!recipient) throw createError("No registered user found with that email", 404);
  if (sameId(recipient._id, userId)) throw createError("You already own this board", 400);
  if (board.members.some((member) => sameId(member.user, recipient._id))) {
    throw createError("This user already has access", 409);
  }

  board.members.push({ user: recipient._id, role: "viewer" });
  await board.save();

  return boardQuery().findById(board._id);
};

export const removeBoardMemberService = async (boardId, userId, memberId) => {
  const board = await Board.findOneAndUpdate(
    { _id: boardId, owner: userId },
    { $pull: { members: { user: memberId } } },
    { new: true },
  );

  if (!board) throw createError("Board not found", 404);
  return boardQuery().findById(board._id);
};

export const leaveBoardService = async (boardId, userId) => {
  const board = await Board.findOneAndUpdate(
    { _id: boardId, owner: { $ne: userId }, "members.user": userId },
    { $pull: { members: { user: userId } } },
  );

  if (!board) throw createError("Shared board not found", 404);
};
