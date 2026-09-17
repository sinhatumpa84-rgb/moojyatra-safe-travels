import { callGroqWithJson } from "../lib/groqClient.js";
import { RECOMMENDATION_SYSTEM_PROMPT } from "../lib/prompts.js";
import { getPromptGroundingContext } from "../lib/dataContext.js";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { destination, budget, duration, interests = [], travelerType = "solo" } = body;

    if (!destination) {
      return res.status(400).json({ error: "Destination is required." });
    }

    const groundingContext = getPromptGroundingContext(destination);

    const userPrompt = `
Generate ranked recommendations for:
- Destination: ${destination}
- Budget: ${budget ? `₹${budget}` : "flexible"}
- Duration: ${duration || "1-2 days"}
- Traveler Type: ${travelerType}
- Specific Interests: ${interests.length > 0 ? interests.join(", ") : "Authentic experiences, food, heritage"}

Provide 4 to 6 top curated spots/experiences that match these specific preferences.
`;

    const recommendations = await callGroqWithJson({
      messages: [
        { role: "system", content: `${RECOMMENDATION_SYSTEM_PROMPT}\n${groundingContext}` },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
    });

    return res.status(200).json(recommendations);
  } catch (error: any) {
    console.error("Recommendations Error:", error);
    const msg = error?.message || "Internal server error generating recommendations.";
    const statusCode = msg.includes("GROQ_API_KEY_MISSING") ? 503 : 500;
    return res.status(statusCode).json({ error: msg });
  }
}
