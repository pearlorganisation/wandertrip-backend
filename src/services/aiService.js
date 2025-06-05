// services/aiService.js
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config/index.js";
import { getTravelRecommendationPrompt } from "../prompts/travelRecommendation.prompt.js";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const generateTravelRecommendations = async (destinationName) => {
  const prompt = getTravelRecommendationPrompt(destinationName);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content;

  // Optional: If GPT still includes backticks, remove them
  const cleaned = text.replace(/```json|```/g, "").trim();

  console.log("Cleaned Text:", cleaned);

  const json = JSON.parse(cleaned);

  // Skip destination if error or dummy data
  if (
    json.error === "Destination not found" ||
    json.bestTimeToVisit === "N/A"
  ) {
    console.warn(
      `⚠️ Skipping unknown or invalid destination: ${destinationName}`
    );
    return null;
  }

  return json;
};
