import asyncHandler from "../../shared/utils/asynch-handler.js";
import {
  createTaskService,
  deleteTaskService,
  getTasksService,
  reorderTasksService,
  updateTaskService,
} from "./task.service.js";

export const createTask = asyncHandler(async (req, res) => {
  const task = await createTaskService(req.user._id, req.validatedBody);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
});

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await getTasksService(req.user._id);

  res.status(200).json({
    success: true,
    tasks,
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await updateTaskService(req.user._id, req.params.taskId, req.validatedBody);

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task,
  });
});

export const reorderTasks = asyncHandler(async (req, res) => {
  await reorderTasksService(req.user._id, req.validatedBody.ids);

  res.status(200).json({
    success: true,
    message: "Tasks reordered successfully",
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  await deleteTaskService(req.user._id, req.params.taskId);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});
