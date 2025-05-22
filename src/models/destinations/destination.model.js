import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, trim: true },
    slug: { type: String, unique: true, required: true, trim: true },
    country: { type: String, required: true },
    description: { type: String, required: true },
    imageKey: { type: String, required: true },
    bannerKey: { type: String, required: true },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    numberOfRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Destination = mongoose.model("Destination", destinationSchema);

export default Destination;
