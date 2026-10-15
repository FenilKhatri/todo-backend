import { v2 as cloudinary } from "cloudinary";

export const AVATAR_FOLDER = "todo";

let configured = false;

// Configured on first use: app.js loads .env after this module is imported.
export const getCloudinary = () => {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
};
