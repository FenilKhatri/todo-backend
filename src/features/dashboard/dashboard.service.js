import Task from "../tasks/task.model.js";

export const getDashboardSummaryService = async (ownerId) => {
  const now = new Date();
  const [total, completed, overdue] = await Promise.all([
    Task.countDocuments({ owner: ownerId }),
    Task.countDocuments({ owner: ownerId, status: "completed" }),
    Task.countDocuments({
      owner: ownerId,
      status: { $ne: "completed" },
      dueDate: { $ne: null, $lt: now },
    }),
  ]);

  return { total, completed, overdue };
};
