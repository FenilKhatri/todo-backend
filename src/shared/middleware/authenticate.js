import jwt from "jsonwebtoken";
import User from "../../features/auth/auth.model.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      const error = new Error("Authentication required!");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      const error = new Error("Invalid authentication token");
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
