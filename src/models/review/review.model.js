import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Types.ObjectId,
      ref: "Destination",
      required: [true, "Destination id is required"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User id is required"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Rating is required"],
    },
    content: {
      type: String,
      minlength: [10, "Content must be at least 10 characters"],
      maxlength: [1000, "Content must not exceed 1000 characters"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
