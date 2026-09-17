import { callGroqWithJson } from "../lib/groqClient.js";
import { OPTIMIZE_TRIP_SYSTEM_PROMPT } from "../lib/prompts.js";
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
    const { existingItinerary, optimizationRequest } = body;

    if (!existingItinerary || !optimizationRequest) {
      return res.status(400).json({ error: "both existingItinerary and optimizationRequest are required." });
    }

    const dest = existingItinerary.destination || "";
    const groundingContext = getPromptGroundingContext(dest);

    const userPrompt = `
Here is the current itinerary:
${JSON.stringify(existingItinerary, null, 2)}

User optimization request:
"${optimizationRequest}"

Please modify the itinerary according to this request while keeping it realistic, geographically coherent, and within realistic price benchmarks. Explain the key changes in the updated 'trip_summary'.
`;

    const optimized = await callGroqWithJson({
      messages: [
        { role: "system", content: `${OPTIMIZE_TRIP_SYSTEM_PROMPT}\n${groundingContext}` },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
    });

    return res.status(200).json(optimized);
  } catch (error: any) {
    console.error("Optimize Trip Error:", error);
    const msg = error?.message || "Internal server error optimizing itinerary.";
    const statusCode = msg.includes("GROQ_API_KEY_MISSING") ? 503 : 500;
    return res.status(statusCode).json({ error: msg });
  }
}
