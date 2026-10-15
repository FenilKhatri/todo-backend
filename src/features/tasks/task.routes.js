import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { createTask, deleteTask, getTasks, reorderTasks, updateTask } from "./task.controller.js";
import { createTaskSchema, reorderTasksSchema, updateTaskSchema } from "./task.validation.js";

const taskRoutes = Router();

taskRoutes.get("/", getTasks);
taskRoutes.post("/", validate(createTaskSchema), createTask);
taskRoutes.patch("/reorder", validate(reorderTasksSchema), reorderTasks);
taskRoutes.patch("/:taskId", validate(updateTaskSchema), updateTask);
taskRoutes.delete("/:taskId", deleteTask);

export default taskRoutes;
