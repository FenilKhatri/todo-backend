import mongoose from "mongoose";

const otpRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email", "password", "reset"],
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    // email or phone number to which the OTP was sent. This is used to verify that the user is trying to verify the correct contact method.
    value: {
      type: String,
      default: "",
      select: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    // When the current code was issued; used to throttle resends.
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

otpRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OtpRequest", otpRequestSchema);
