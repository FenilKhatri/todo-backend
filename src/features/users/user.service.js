import User from "../auth/auth.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchUsersService = async (currentUserId, query) => {
  const term = query.trim();
  if (term.length < 2) return [];

  return User.find({
    _id: { $ne: currentUserId },
    $or: [
      { email: { $regex: escapeRegex(term), $options: "i" } },
      { userName: { $regex: escapeRegex(term), $options: "i" } },
    ],
  })
    .select("userName email")
    .limit(5);
};
