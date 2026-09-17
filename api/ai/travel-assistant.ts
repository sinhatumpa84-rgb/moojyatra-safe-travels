import { callGroqWithJson } from "../lib/groqClient.js";
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../lib/prompts.js";
import { getPromptGroundingContext } from "../lib/dataContext.js";

export default async function handler(req: any, res: any) {
  // Set CORS headers
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
    const { messages, destination, language } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Limit conversation history length to avoid excessive token consumption
    const trimmedMessages: Array<{ role: "user" | "assistant"; content: string }> = messages.slice(-10).map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 1500),
    }));

    // Detect destination if not passed
    const lastUserMessage = trimmedMessages[trimmedMessages.length - 1]?.content || "";
    const groundingContext = getPromptGroundingContext(destination || lastUserMessage);

    const fullSystemPrompt = `${TRAVEL_ASSISTANT_SYSTEM_PROMPT}\n${groundingContext}\nUser Preferred Language: ${language || "auto-detect"}`;

    const completion = await callGroqWithJson({
      messages: [
        { role: "system", content: fullSystemPrompt },
        ...trimmedMessages,
      ],
      temperature: 0.4,
    });

    return res.status(200).json(completion);
  } catch (error: any) {
    console.error("Travel Assistant Error:", error);
    const msg = error?.message || "Internal server error processing travel request.";
    const statusCode = msg.includes("GROQ_API_KEY_MISSING") ? 503 :
                       msg.includes("GROQ_RATE_LIMIT") ? 429 :
                       msg.includes("GROQ_INVALID_KEY") ? 401 : 500;
    return res.status(statusCode).json({
      error: msg,
      fallbackAnswer: "YatraBot is temporarily offline or Groq API key is not configured. Please ensure GROQ_API_KEY is configured in your environment.",
    });
  }
}
