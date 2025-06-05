import Destination from "../../models/destinations/destination.model.js";
import TravelRecommendation from "../../models/travelRecommendation/travelRecommendation.model.js";
import { generateTravelRecommendations } from "../../services/aiService.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";

export const refreshRecommendationsManually = asyncHandler(
  async (req, res, next) => {
    const destinations = await Destination.find();
    if (!destinations || destinations.length === 0) {
      return next(new ApiError("No destinations found", 404));
    }
    for (const dest of destinations) {
      try {
        const recommendations = await generateTravelRecommendations(dest.name);
        if (!recommendations) continue;
        await TravelRecommendation.findOneAndUpdate(
          { destination: dest._id },
          {
            ...recommendations,
            destination: dest._id,
            aiGenerated: true,
          },
          { upsert: true, new: true }
        );

        console.log(`✅ Refreshed recommendation for: ${dest.name}`);
      } catch (err) {
        console.error(`❌ Error updating ${dest.name}:`, err.message);
      }
    }

    res.status(200).json({
      success: true,
      message:
        "All travel recommendations refreshed manually for destinations.",
    });
  }
);
