import mongoose from "mongoose";

const createUser = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 12,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    profilePicturePublicId: {
      type: String,
      default: "",
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordTokenExp: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", createUser);
