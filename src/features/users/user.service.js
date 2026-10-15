import mongoose from "mongoose";
import User from "../auth/auth.model.js";
import Board from "../boards/board.model.js";

const RESULT_LIMIT = 5;
const PUBLIC_FIELDS = "userName email profilePicture";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Owner + members of a board, so suggestions skip people who already have access to it.
const boardPeopleIds = async (boardId) => {
  if (!boardId || !mongoose.isValidObjectId(boardId)) return [];
  const board = await Board.findById(boardId).select("owner members.user").lean();
  return board ? [board.owner, ...board.members.map((member) => member.user)] : [];
};

// People to show before anything is typed: collaborators from the user's other boards first,
// then the most recently joined users, excluding the user and anyone in `boardId`.
const suggestedUsers = async (currentUserId, boardId) => {
  const exclude = new Set([String(currentUserId), ...(await boardPeopleIds(boardId)).map(String)]);

  const boards = await Board.find({ $or: [{ owner: currentUserId }, { "members.user": currentUserId }] })
    .select("owner members.user")
    .lean();
  const collaboratorIds = [
    ...new Set(boards.flatMap((board) => [board.owner, ...board.members.map((member) => member.user)]).map(String)),
  ].filter((id) => !exclude.has(id));

  const collaborators = await User.find({ _id: { $in: collaboratorIds } })
    .select(PUBLIC_FIELDS)
    .limit(RESULT_LIMIT);
  if (collaborators.length >= RESULT_LIMIT) return collaborators;

  const others = await User.find({
    _id: { $nin: [...exclude, ...collaborators.map((user) => String(user._id))] },
  })
    .select(PUBLIC_FIELDS)
    .sort({ createdAt: -1 })
    .limit(RESULT_LIMIT - collaborators.length);

  return [...collaborators, ...others];
};

export const searchUsersService = async (currentUserId, query, boardId) => {
  const term = query.trim();
  if (!term) return suggestedUsers(currentUserId, boardId);
  if (term.length < 2) return [];

  return User.find({
    _id: { $ne: currentUserId },
    $or: [
      { email: { $regex: escapeRegex(term), $options: "i" } },
      { userName: { $regex: escapeRegex(term), $options: "i" } },
    ],
  })
    .select(PUBLIC_FIELDS)
    .limit(RESULT_LIMIT);
};
