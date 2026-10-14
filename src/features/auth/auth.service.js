import bcrypt from "bcryptjs";
import User from "./auth.model.js";
import { createError } from "../../shared/errors/custom-error.js";
import generateToken from "../../shared/utils/generate-token.js";

export const registerUserService = async ({ userName, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    userName,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
    token,
  };
};

export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError("Invalid email or password", 401);
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
    token,
  };
};
