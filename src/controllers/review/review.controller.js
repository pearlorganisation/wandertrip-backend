import { calculateAverageRating } from "../../helpers/ratingHelper.js";
import Destination from "../../models/destinations/destination.model.js";
import Review from "../../models/review/review.model.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";
import { paginate } from "../../utils/pagination.js";

export const getAllReviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page || "1"); // Current page
  const limit = parseInt(req.query.limit || "10"); // Limit per page
  const sortByParam = req.query.sortBy || "newest"; // Default: Newest first

  const filter = {};
  if (req.query?.rating) {
    // Filter by rating if provided 1 and up
    filter.rating = {
      $gte: parseInt(req.query.rating),
    };
  }

  // Determine sorting order based on sortBy using switch case
  let sortBy;
  switch (sortByParam) {
    case "highest":
      sortBy = { rating: -1 }; // Highest rating first
      break;
    case "lowest":
      sortBy = { rating: 1 };
    case "newest":
      sortBy = { createdAt: -1 }; // Newest first
      break;
    case "oldest":
      sortBy = { createdAt: 1 }; // Oldest first
      break;
    default:
      sortBy = { createdAt: -1 }; // Default: Newest first
      break;
  }

  // Use the pagination utility function
  const { data: reviews, pagination } = await paginate(
    Review,
    parseInt(page),
    parseInt(limit),
    filter,
    [
      { path: "destination" },
      { path: "user", select: "-password -refreshToken" },
    ],
    sortBy
  );

  if (!reviews || reviews.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No reviews found",
      data: [],
    });
  }

  // Return paginated response
  return res.status(200).json({
    success: true,
    message: "Reviews fetched successfully",
    pagination,
    data: reviews,
  });
});

export const createReview = asyncHandler(async (req, res, next) => {
  const { destination, rating, content } = req.body;

  const existingDestination = await Destination.findById(destination);
  if (!existingDestination) {
    return next(new ApiError("Destination not found", 404));
  }

  const review = new Review({
    destination,
    user: req.user?._id,
    rating,
    content,
  });
  await review.save();

  // Calculate and update the vehicle's rating
  const { averageRating, numberOfRatings } = await calculateAverageRating(
    destination
  );

  existingDestination.averageRating = averageRating;
  existingDestination.numberOfRatings = numberOfRatings;
  await existingDestination.save();

  return res.status(201).json({
    success: true,
    message: "Review created.",
    data: review,
  });
});

export const updateReviewById = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  if (!reviewId) {
    return next(new ApiError("Review Id is required", 400));
  }

  const allowedUpdates = ["rating", "content"];
  const updates = Object.keys(req.body);
  console.log("updates: ", updates);

  const isValidOperation = updates.every((key) => allowedUpdates.includes(key));
  if (!isValidOperation) {
    return next(new ApiError("Invalid fields in update request", 400));
  }

  const review = await Review.findByIdAndUpdate(reviewId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!review) {
    return next(new ApiError("Review not found", 404));
  }

  const destination = await Destination.findById(review.destination);
  if (!destination) {
    return next(new ApiError("Destination not found", 404));
  }

  // Calculate and update the vehicle's rating
  const { averageRating, numberOfRatings } = await calculateAverageRating(
    review.vehicleId
  );
  destination.averageRating = averageRating;
  destination.numberOfRatings = numberOfRatings;
  await destination.save();

  return res.status(200).json({
    success: true,
    message: "Review updated successfully.",
    data: review,
  });
});

export const deleteReviewById = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  if (!reviewId) {
    return next(new ApiError("Review Id is required", 400));
  }

  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    return next(new ApiError("Review not found", 404));
  }

  const destination = await Destination.findById(review.destination);
  if (!destination) {
    return next(new ApiError("Destination not found", 404));
  }

  // Calculate and update the vehicle's rating
  const { averageRating, numberOfRatings } = await calculateAverageRating(
    review.destination
  );
  destination.averageRating = averageRating;
  destination.numberOfRatings = numberOfRatings;
  await destination.save();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully.",
  });
});
