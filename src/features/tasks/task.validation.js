import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Board is invalid.");

const dueDateSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value, context) => {
    if (value === undefined) return undefined;
    if (!value) return null;

    const date = new Date(`${value}T23:59:59.999`);
    if (Number.isNaN(date.getTime())) {
      context.addIssue({ code: "custom", message: "Due date must be valid." });
      return z.NEVER;
    }

    return date;
  });

const taskFields = {
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long.")
    .max(100, "Title must be at most 100 characters long."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters long."),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in-progress", "completed"]),
  dueDate: dueDateSchema,
  boardId: z.union([objectIdSchema, z.null()]).optional(),
};

export const createTaskSchema = z.object({
  title: taskFields.title,
  description: taskFields.description.optional().default(""),
  priority: taskFields.priority.optional().default("medium"),
  dueDate: dueDateSchema.default(null),
  boardId: taskFields.boardId,
});

export const reorderTasksSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Task is invalid.")).max(1000),
});

export const updateTaskSchema = z
  .object({
    title: taskFields.title.optional(),
    description: taskFields.description.optional(),
    priority: taskFields.priority.optional(),
    status: taskFields.status.optional(),
    dueDate: dueDateSchema,
    boardId: taskFields.boardId,
  })
  .refine((value) => Object.keys(value).length > 0, "No changes were provided.");
