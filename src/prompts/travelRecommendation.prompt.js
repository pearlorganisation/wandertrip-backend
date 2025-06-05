export const getTravelRecommendationPrompt = (destinationName) => `
You are a travel expert. For the destination "${destinationName}", provide the following details **only if it is a real and well-known travel destination**:

1. Best time to visit
2. Recommended duration for visit
3. Top 3 activities to do there

If the destination is fictional, misspelled, or unknown, respond exactly with:

{
  "error": "Destination not found"
}

Otherwise, respond strictly in **valid JSON format** like this:

{
  "bestTimeToVisit": "...",
  "recommendedDuration": "...",
  "topActivities": ["...", "...", "..."]
}

Do **not** include markdown formatting such as \`\`\`json or any explanatory text.
`;
