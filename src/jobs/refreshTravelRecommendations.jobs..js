import cron from "node-cron";
import Destination from "../models/destinations/destination.model.js";
import { generateTravelRecommendations } from "../services/aiService.js";
import TravelRecommendation from "../models/travelRecommendation/travelRecommendation.model.js";
import { cronConfig } from "../config/cron-config.js";

export const scheduleRecommendationRefresh = () => {
  cron.schedule(cronConfig.daily, async () => {
    console.log("🔁 Running AI travel recommendation refresh cron...");

    const destinations = await Destination.find();

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

    console.log("✅ All recommendations refreshed.");
  });
};

//runs daily at midnight (00:00)=> "0 0 * * *"
