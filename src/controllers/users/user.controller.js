import User from "../../models/users/user.model.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const { email } = req.user;
  if (!email) {
    return next(new ApiError("Unauthorized User", 401));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("User not found", 401));
  }

  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    return next(new ApiError("Wrong password", 400));
  }

  if (newPassword === currentPassword) {
    return next(
      new ApiError("New password cannot be the same as the old password", 400)
    );
  }

  if (newPassword !== confirmNewPassword) {
    return next(new ApiError("New passwords do not match", 400));
  }

  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
});

export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    return next(new ApiError("User is not found", 404));
  }
  return res
    .status(200)
    .json({ success: true, message: "User found successfully", data: user });
});
