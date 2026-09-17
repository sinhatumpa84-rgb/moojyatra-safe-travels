import { callGroqWithJson } from "../lib/groqClient.js";
import { ITINERARY_SYSTEM_PROMPT } from "../lib/prompts.js";
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
    const { destination, days = 2, budget, interests = [], travelers = 1, travelStyle = "explorer" } = body;

    if (!destination || typeof destination !== "string") {
      return res.status(400).json({ error: "Destination is required." });
    }

    const groundingContext = getPromptGroundingContext(destination);

    const userPrompt = `
Generate a structured, realistic ${days}-day itinerary for:
- Destination: ${destination}
- Number of Days: ${days}
- Budget: ${budget ? `₹${budget}` : "Mid-range budget appropriate for this city"}
- Traveler Count: ${travelers}
- Interests: ${interests.length > 0 ? interests.join(", ") : "Heritage, Local Food, Photography, Culture"}
- Travel Style: ${travelStyle} (e.g. relaxed, budget backpacker, cultural explorer)

Ensure days are well grouped geographically, prices are realistic in INR (₹), and local transit tips are included.
`;

    const itinerary = await callGroqWithJson({
      messages: [
        { role: "system", content: `${ITINERARY_SYSTEM_PROMPT}\n${groundingContext}` },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
    });

    return res.status(200).json(itinerary);
  } catch (error: any) {
    console.error("Itinerary Generator Error:", error);
    const msg = error?.message || "Internal server error generating itinerary.";
    const statusCode = msg.includes("GROQ_API_KEY_MISSING") ? 503 : 500;
    return res.status(statusCode).json({ error: msg });
  }
}
