import User from "../../models/users/user.model.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";
import { paginate } from "../../utils/pagination.js";

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, roles } = req.query;
  const { search } = req.query;
  let filter = {
    _id: { $ne: req.user._id }, // Exclude the current user.
  };
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const { data: users, pagination } = await paginate(
    User,
    parseInt(page),
    parseInt(limit),
    filter
  );

  if (!users || users.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No users found.",
      data: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: "Fetched all Users successfully",
    pagination,
    data: users,
  });
});

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
