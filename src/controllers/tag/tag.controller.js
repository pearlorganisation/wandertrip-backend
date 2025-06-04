import Tag from "../../models/tag/tag.model.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";

export const createTag = asyncHandler(async (req, res, next) => {
  const { name, categories } = req.body;
  const tag = await Tag.create({ name, categories });

  if (!tag) return next(new ApiError("Failed to create the tag", 400));

  return res
    .status(201)
    .json({ success: true, message: "Tag created successfully", data: tag });
});

export const getAllTags = asyncHandler(async (req, res, next) => {
  const tags = await Tag.find()
    .populate([{ path: "categories", select: "-__v -createdAt -updatedAt" }])
    .select("-__v");

  if (!tags || tags.length === 0) {
    return next(new ApiError("No tags found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Tags retrieved successfully",
    data: tags,
  });
});

export const updateTagById = asyncHandler(async (req, res, next) => {
  const { name, categories } = req.body;

  const tag = await Tag.findByIdAndUpdate(
    req.params.id,
    { name, categories },
    { new: true, runValidators: true }
  );

  if (!tag) return next(new ApiError("Failed to update the tag", 400));

  return res
    .status(200)
    .json({ success: true, message: "Tag updated successfully", data: tag });
});

export const deleteTagById = asyncHandler(async (req, res, next) => {
  const tag = await Tag.findByIdAndDelete(req.params.id);

  if (!tag) return next(new ApiError("Tag not found", 404));

  return res.status(200).json({
    success: true,
    message: "Tag deleted successfully",
  });
});
