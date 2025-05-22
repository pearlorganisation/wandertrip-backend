import { calculateAverageRating } from "../../helpers/ratingHelper.js";
import Destination from "../../models/destinations/destination.model.js";
import Review from "../../models/review/review.model.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";

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
