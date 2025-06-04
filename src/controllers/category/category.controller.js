import Category from "../../models/category/category.model.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res, next) => {
  let { categories } = req.body;

  if (!Array.isArray(categories) || categories.length === 0) {
    return next(new ApiError("Categories must be a non-empty array", 400));
  }

  // If category items are strings, convert them to objects
  categories = categories.map((item) =>
    typeof item === "string" ? { name: item } : item
  );

  const category = await Category.insertMany(categories);

  if (!category) {
    return next(new ApiError("Failed to create the categories", 400));
  }

  return res.status(201).json({
    success: true,
    message: "Categories created successfully",
    data: category,
  });
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().select("-__v ");

  if (!categories || categories.length === 0)
    return next(new ApiError("No categories found", 404));

  return res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

export const updateCategoryById = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true }
  );

  if (!category)
    return next(new ApiError("Failed to update the category", 400));

  return res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

export const deleteCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params?.id);

  if (!category) return next(new ApiError("Category not found", 404));

  return res
    .status(200)
    .json({ success: true, message: "Category deleted successfully" });
});
