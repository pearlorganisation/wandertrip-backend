import mongoose from "mongoose";

const travelRecommendationSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    bestTimeToVisit: String,
    recommendedDuration: String,
    topActivities: [String],
    aiGenerated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TravelRecommendation = mongoose.model(
  "TravelRecommendation",
  travelRecommendationSchema
);

export default TravelRecommendation;
