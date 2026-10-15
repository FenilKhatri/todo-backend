import bcrypt from "bcryptjs";
import User from "../auth/auth.model.js";
import { createOtpRequest, resendOtp, toChallenge, verifyOtp } from "../../shared/otp/otp.service.js";
import { createError } from "../../shared/errors/custom-error.js";
import { AVATAR_FOLDER, getCloudinary } from "../../config/cloudinary.js";
import canonicalEmail from "../../shared/utils/canonical-email.js";

const toProfile = (user) => ({
  id: user._id,
  userName: user.userName,
  email: user.email,
  profilePicture: user.profilePicture,
  createdAt: user.createdAt,
});

const findUser = async (userId, select = "") => {
  const user = await User.findById(userId).select(select);
  if (!user) throw createError("User not found", 404);
  return user;
};

const assertEmailAvailable = async (email, userId) => {
  if (await User.exists({ email, _id: { $ne: userId } })) {
    throw createError("This email is already in use by another account.", 409);
  }
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";

// Named after the user; the id suffix keeps two users with the same name apart.
const avatarPublicId = (user) => `${AVATAR_FOLDER}/${slugify(user.userName)}_${user._id}`;

const uploadToCloudinary = (buffer, publicId) =>
  new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(
      {
        public_id: publicId,
        asset_folder: AVATAR_FOLDER,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });

const cloudinaryError = (error, message) => {
  console.error(error);
  return createError(message, 502);
};

export const getProfileService = async (userId) => toProfile(await findUser(userId));

export const updateProfileService = async (userId, { userName }) => {
  const user = await findUser(userId);
  user.userName = userName;

  // Keep the avatar's Cloudinary name in step with the profile name.
  const nextPublicId = avatarPublicId(user);
  if (user.profilePicturePublicId && user.profilePicturePublicId !== nextPublicId) {
    try {
      const renamed = await getCloudinary().uploader.rename(user.profilePicturePublicId, nextPublicId, {
        overwrite: true,
        invalidate: true,
      });
      user.profilePicture = renamed.secure_url;
      user.profilePicturePublicId = renamed.public_id;
    } catch (error) {
      throw cloudinaryError(error, "Couldn't rename your profile image. Please try again.");
    }
  }

  await user.save();
  return toProfile(user);
};

export const uploadAvatarService = async (userId, file) => {
  const user = await findUser(userId);
  const publicId = avatarPublicId(user);

  let uploaded;
  try {
    uploaded = await uploadToCloudinary(file.buffer, publicId);
  } catch (error) {
    throw cloudinaryError(error, "Couldn't upload your image. Please try again.");
  }

  const previousId = user.profilePicturePublicId;
  user.profilePicture = uploaded.secure_url;
  user.profilePicturePublicId = uploaded.public_id;
  await user.save();

  // Clean up an image stored under an older name.
  if (previousId && previousId !== uploaded.public_id) {
    getCloudinary().uploader.destroy(previousId, { invalidate: true }).catch(console.error);
  }

  return toProfile(user);
};

export const removeAvatarService = async (userId) => {
  const user = await findUser(userId);
  if (user.profilePicturePublicId) {
    try {
      await getCloudinary().uploader.destroy(user.profilePicturePublicId, { invalidate: true });
    } catch (error) {
      throw cloudinaryError(error, "Couldn't remove your image. Please try again.");
    }
  }
  user.profilePicture = "";
  user.profilePicturePublicId = "";
  await user.save();
  return toProfile(user);
};

export const createChangeRequestService = async (userId, data) => {
  let value;

  if (data.type === "email") {
    const user = await findUser(userId);
    if (canonicalEmail(user.email) === canonicalEmail(data.email)) {
      throw createError("This is already your email address.", 400);
    }
    await assertEmailAvailable(data.email, userId);
    value = data.email;
  } else {
    const user = await findUser(userId, "+password");
    if (!(await bcrypt.compare(data.currentPassword, user.password))) {
      throw createError("Current password is incorrect.", 400);
    }
    value = await bcrypt.hash(data.newPassword, 12);
  }

  const { request, otp } = await createOtpRequest({ user: userId, type: data.type, value });
  return toChallenge(request, otp);
};

const CHANGE_TYPES = { $in: ["email", "password"] };

export const resendChangeOtpService = async (userId, requestId) => {
  const { request, otp } = await resendOtp({ _id: requestId, user: userId, type: CHANGE_TYPES });
  return toChallenge(request, otp);
};

export const verifyChangeService = async (userId, requestId, otp) => {
  const request = await verifyOtp({ _id: requestId, user: userId, type: CHANGE_TYPES }, otp);

  const user = await findUser(userId);
  if (request.type === "email") {
    await assertEmailAvailable(request.value, userId);
    user.email = request.value;
  } else {
    user.password = request.value;
  }
  await user.save();
  await request.deleteOne();

  return { type: request.type, user: toProfile(user) };
};
