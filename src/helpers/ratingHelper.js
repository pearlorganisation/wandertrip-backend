import Review from "../models/review/review.model.js";

export const calculateAverageRating = async (destination) => {
  const reviews = await Review.find({ destination });
  const numberOfRatings = reviews.length;

  const averageRating =
    numberOfRatings > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) /
        numberOfRatings
      : 0;

  // Round to one decimal place
  const roundedAverageRating = Math.round(averageRating * 10) / 10;
  return {
    averageRating: roundedAverageRating,
    numberOfRatings,
  };
};
