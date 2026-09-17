// Client-side AI Service for communicating with Moojyatra's Groq Serverless APIs

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BudgetBreakdown {
  transport: number;
  food: number;
  stay: number;
  activities: number;
  total: number;
}

export interface PlaceRecommendation {
  name: string;
  category: string;
  estimated_budget: string;
  highlight: string;
}

export interface AssistantResponse {
  answer: string;
  suggestions?: string[];
  follow_up_questions?: string[];
  budget_breakdown?: BudgetBreakdown | null;
  scam_alert?: string | null;
  recommended_places?: PlaceRecommendation[];
  fallbackAnswer?: string;
  error?: string;
}

export interface ItineraryActivity {
  time_slot: string;
  name: string;
  category: string;
  duration: string;
  estimated_cost: string;
  reason: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  estimated_budget: number;
  activities: ItineraryActivity[];
}

export interface ItineraryResponse {
  destination: string;
  duration: string;
  trip_summary: string;
  estimated_total_budget: number;
  budget_breakdown?: BudgetBreakdown;
  days: ItineraryDay[];
  tips?: string[];
  error?: string;
}

export interface SearchIntentResponse {
  destination?: string;
  category?: string;
  budget?: string;
  budget_max?: number;
  duration?: string;
  traveler_type?: string;
  interests?: string[];
  keywords?: string[];
  interpreted_query?: string;
  error?: string;
}

export interface RecommendationItem {
  name: string;
  category: string;
  reason: string;
  estimated_duration: string;
  estimated_budget: string;
  best_time_to_visit?: string;
  tags?: string[];
}

export interface DestinationRecommendationsResponse {
  destination: string;
  recommendations: RecommendationItem[];
  error?: string;
}

async function postJson<T>(endpoint: string, payload: any): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error || `Request failed with status ${res.status}`;
    if (res.status === 503 && errorMsg.includes("GROQ_API_KEY_MISSING")) {
      throw new Error("Groq API key is not configured on the server. Please set GROQ_API_KEY in environment variables.");
    }
    if (res.status === 429) {
      throw new Error("AI request limit reached. Please wait a moment and try again.");
    }
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function askTravelAssistant(params: {
  messages: ChatMessage[];
  destination?: string;
  language?: string;
}): Promise<AssistantResponse> {
  return postJson<AssistantResponse>("/api/ai/travel-assistant", params);
}

export async function generateItinerary(params: {
  destination: string;
  days?: number;
  budget?: number | string;
  interests?: string[];
  travelers?: number;
  travelStyle?: string;
}): Promise<ItineraryResponse> {
  return postJson<ItineraryResponse>("/api/ai/itinerary", params);
}

export async function optimizeTrip(params: {
  existingItinerary: ItineraryResponse;
  optimizationRequest: string;
}): Promise<ItineraryResponse> {
  return postJson<ItineraryResponse>("/api/ai/optimize-trip", params);
}

export async function interpretSearchQuery(query: string): Promise<SearchIntentResponse> {
  return postJson<SearchIntentResponse>("/api/ai/search", { query });
}

export async function getDestinationRecommendations(params: {
  destination: string;
  budget?: string | number;
  duration?: string;
  interests?: string[];
  travelerType?: string;
}): Promise<DestinationRecommendationsResponse> {
  return postJson<DestinationRecommendationsResponse>("/api/ai/recommendations", params);
}
