import { callGroqWithJson, FAST_GROQ_MODEL } from "../lib/groqClient.js";
import { SEARCH_INTERPRETER_SYSTEM_PROMPT } from "../lib/prompts.js";

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
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const interpreted = await callGroqWithJson({
      messages: [
        { role: "system", content: SEARCH_INTERPRETER_SYSTEM_PROMPT },
        { role: "user", content: `Analyze this travel search query and extract structured intent: "${query.slice(0, 300)}"` }
      ],
      model: FAST_GROQ_MODEL, // fast model for quick search interpretation
      temperature: 0.1,
    });

    return res.status(200).json(interpreted);
  } catch (error: any) {
    console.error("Search Interpreter Error:", error);
    const msg = error?.message || "Internal server error interpreting query.";
    const statusCode = msg.includes("GROQ_API_KEY_MISSING") ? 503 : 500;
    return res.status(statusCode).json({ error: msg });
  }
}
