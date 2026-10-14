import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["viewer"],
          default: "viewer",
        },
      },
    ],
  },
  { timestamps: true },
);

boardSchema.index({ owner: 1, name: 1 });

export default mongoose.model("Board", boardSchema);
