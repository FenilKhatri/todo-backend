import multer from "multer";
import { createError } from "../errors/custom-error.js";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: (req, file, callback) => {
    if (IMAGE_TYPES.includes(file.mimetype)) return callback(null, true);
    callback(createError("Only JPG, PNG, WEBP or GIF images are allowed.", 400));
  },
});

// Accepts a single image under `field` and turns multer errors into 400 responses.
export const uploadImage = (field) => (req, res, next) => {
  upload.single(field)(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE" ? "Image must be smaller than 5 MB." : error.message;
      return next(createError(message, 400));
    }
    next(error);
  });
};
