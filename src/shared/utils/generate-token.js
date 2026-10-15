import jwt from "jsonwebtoken";

const generateToken = (userId, expiresIn = "1d") => {
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

export default generateToken;
