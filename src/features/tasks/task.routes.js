import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { createTask, deleteTask, getTasks, updateTask } from "./task.controller.js";
import { createTaskSchema, updateTaskSchema } from "./task.validation.js";

const taskRoutes = Router();

taskRoutes.get("/", getTasks);
taskRoutes.post("/", validate(createTaskSchema), createTask);
taskRoutes.patch("/:taskId", validate(updateTaskSchema), updateTask);
taskRoutes.delete("/:taskId", deleteTask);

export default taskRoutes;
