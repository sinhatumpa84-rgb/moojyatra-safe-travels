import Groq from "groq-sdk";

export const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
export const FAST_GROQ_MODEL = "llama-3.1-8b-instant";

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_groq_api_key_here") {
    throw new Error("GROQ_API_KEY_MISSING: Groq API key is not configured on the server. Please set GROQ_API_KEY in environment variables.");
  }
  return new Groq({ apiKey });
}

export interface GroqCompletionOptions {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
}

export async function callGroqWithJson<T = any>(
  options: GroqCompletionOptions
): Promise<T> {
  const groq = getGroqClient();
  const model = options.model || DEFAULT_GROQ_MODEL;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 2048,
      response_format: options.jsonMode !== false ? { type: "json_object" } : undefined,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq API.");
    }

    try {
      return JSON.parse(content) as T;
    } catch (parseErr) {
      // Clean potential backticks or markdown fences if model returned them
      const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      return JSON.parse(cleaned) as T;
    }
  } catch (err: any) {
    if (err?.message?.includes("GROQ_API_KEY_MISSING")) {
      throw err;
    }
    if (err?.status === 401 || err?.message?.includes("Invalid API Key")) {
      throw new Error("GROQ_INVALID_KEY: The configured GROQ_API_KEY is invalid. Please verify your API key.");
    }
    if (err?.status === 429 || err?.message?.includes("rate limit")) {
      throw new Error("GROQ_RATE_LIMIT: Groq rate limit reached. Please try again in a few moments.");
    }
    if (err?.code === "ETIMEDOUT" || err?.name === "AbortError" || err?.message?.includes("timeout")) {
      throw new Error("GROQ_TIMEOUT: Groq request timed out. Please try a more specific query.");
    }
    throw new Error(`GROQ_ERROR: ${err.message || "Failed to process request with Groq."}`);
  }
}
