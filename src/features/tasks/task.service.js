import Task from "./task.model.js";
import Board from "../boards/board.model.js";
import { createError } from "../../shared/errors/custom-error.js";

const withBoard = (query) => query.populate("board", "name");

const assertOwnedBoard = async (ownerId, boardId) => {
  if (!boardId) return;

  const board = await Board.findOne({ _id: boardId, owner: ownerId });
  if (!board) throw createError("Board not found", 404);
};

const toTaskData = ({ boardId, ...taskData }) => ({
  ...taskData,
  ...(boardId !== undefined && { board: boardId }),
});

export const createTaskService = async (ownerId, taskData) => {
  await assertOwnedBoard(ownerId, taskData.boardId);

  const task = await Task.create({
    ...toTaskData(taskData),
    owner: ownerId,
  });

  return withBoard(Task.findById(task._id));
};

export const getTasksService = async (ownerId) => {
  return withBoard(Task.find({ owner: ownerId })).sort({ order: 1, createdAt: -1 });
};

export const reorderTasksService = async (ownerId, ids) => {
  await Task.bulkWrite(
    ids.map((id, index) => ({
      updateOne: { filter: { _id: id, owner: ownerId }, update: { order: index } },
    })),
  );
};

export const updateTaskService = async (ownerId, taskId, updates) => {
  await assertOwnedBoard(ownerId, updates.boardId);

  const task = await withBoard(
    Task.findOneAndUpdate(
      { _id: taskId, owner: ownerId },
      toTaskData(updates),
      { new: true, runValidators: true },
    ),
  );

  if (!task) throw createError("Task not found", 404);
  return task;
};

export const deleteTaskService = async (ownerId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, owner: ownerId });
  if (!task) throw createError("Task not found", 404);
};

export const getBoardTasksService = async (boardId) => {
  return withBoard(Task.find({ board: boardId })).sort({ order: 1, createdAt: -1 });
};
