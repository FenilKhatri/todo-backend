import mongoose from "mongoose";

export const connectDB = () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("Mongodb connected successfully!");
  } catch (error) {
    console.log("Failed to connect mongodb!");
  }
};
