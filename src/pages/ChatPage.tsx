import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Loader2, Sparkles, AlertTriangle, IndianRupee, MapPin, SlidersHorizontal, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectLang, Lang } from "@/lib/i18n";
import { askTravelAssistant, optimizeTrip, AssistantResponse, ItineraryResponse } from "@/lib/groq/aiService";
import { toast } from "sonner";

interface EnhancedMsg {
  role: "user" | "assistant";
  content: string;
  metadata?: AssistantResponse;
  itinerary?: ItineraryResponse;
}

const STARTERS: Partial<Record<Lang, string[]>> = {
  en: [
    "I want to visit Kolkata for 2 days with ₹4,000 budget.",
    "What is the real auto fare from New Delhi Station to CP?",
    "Common Taj Mahal scams & how to avoid them?",
    "Plan a peaceful weekend trip to Varanasi with food.",
  ],
  hi: [
    "दिल्ली में ऑटो का असली मीटर किराया क्या है?",
    "ताजमहल पर पर्यटकों के साथ आम धोखे और उनसे कैसे बचें?",
    "वाराणसी में 2 दिन की यात्रा ₹3000 के बजट में बताएं।",
  ],
  bn: [
    "দিল্লিতে অটোর সঠিক সরকারি মিটার ভাড়া কত?",
    "তাজমহলে সাধারণ প্রতারণা থেকে কীভাবে বাঁচবেন?",
    "কলকাতা থেকে ২ দিনের বাজেট ট্রিপের পরিকল্পনা দিন।",
  ],
};
const FALLBACK_STARTERS = STARTERS.en!;

export default function ChatPage() {
  const [messages, setMessages] = useState<EnhancedMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, optimizing]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const detected = detectLang(text);
    setLang(detected);
    setApiKeyError(null);

    const userMsg: EnhancedMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await askTravelAssistant({
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        language: detected,
      });

      const assistantMsg: EnhancedMsg = {
        role: "assistant",
        content: response.answer || response.fallbackAnswer || "Here is what I found for your journey.",
        metadata: response,
      };

      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      const errMsg = err.message || "Unable to reach Groq AI assistant.";
      if (errMsg.includes("GROQ_API_KEY_MISSING") || errMsg.includes("Groq API key is not configured")) {
        setApiKeyError("Groq API key is not configured. Please add GROQ_API_KEY to your environment variables or Vercel settings.");
      }

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: errMsg.includes("GROQ_API_KEY_MISSING")
            ? "⚠️ **Groq AI Key Required**: Please configure `GROQ_API_KEY` in your `.env` or Vercel environment variables to enable intelligent travel planning."
            : `⚠️ ${errMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async (targetMsgIndex: number, request: string) => {
    const targetMsg = messages[targetMsgIndex];
    if (!targetMsg?.itinerary || optimizing) return;

    setOptimizing(true);
    toast.info(`Optimizing: "${request}"...`);

    try {
      const optimized = await optimizeTrip({
        existingItinerary: targetMsg.itinerary,
        optimizationRequest: request,
      });

      const updateMsg: EnhancedMsg = {
        role: "assistant",
        content: `**Trip Optimized (${request}):**\n${optimized.trip_summary}`,
        itinerary: optimized,
      };

      setMessages((prev) => [...prev, updateMsg]);
      toast.success("Itinerary updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to optimize trip.");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="container px-4 py-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-pink-blue grid place-items-center text-white shadow-glow-pink">
              <Bot className="w-6 h-6" />
            </span>
            <span>YatraBot AI</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary-glow border border-primary/30">
              Powered by Groq
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Multilingual smart travel assistant · Anti-scam advice · Real price benchmarks · Itineraries
          </p>
        </div>
      </div>

      {apiKeyError && (
        <div className="mb-4 glass p-3 border border-amber-500/40 rounded-xl flex items-start gap-2 text-amber-200 text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong>Action Recommended:</strong> {apiKeyError}
          </div>
        </div>
      )}

      <div className="glass-strong p-4 flex flex-col h-[70vh] sm:h-[72vh] rounded-2xl shadow-xl">
        <div ref={scrollRef} className="flex-1 overflow-auto space-y-4 pr-1">
          {messages.length === 0 && (
            <div className="text-center py-6 sm:py-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-sunset grid place-items-center text-white mx-auto mb-3 shadow-glow-pink">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold gradient-text">How can I assist your travels today?</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                Ask about genuine prices, scam warnings, itinerary generation for any budget, or legal safety rights in India.
              </p>

              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {(STARTERS[lang] ?? FALLBACK_STARTERS).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="glass text-xs px-3 py-2 rounded-lg hover:bg-white/15 transition text-left border border-white/10"
                  >
                    💬 {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-pink-blue grid place-items-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[80%] space-y-2.5`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-primary/30 text-foreground border border-primary/20 rounded-tr-none"
                      : "glass text-foreground border border-white/10 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>

                {/* Scam Alert badge if returned by Groq */}
                {m.metadata?.scam_alert && (
                  <div className="glass px-3 py-2 border border-red-500/40 rounded-xl text-xs flex items-start gap-2 text-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300">Scam Warning:</strong> {m.metadata.scam_alert}
                    </div>
                  </div>
                )}

                {/* Budget Breakdown Pills */}
                {m.metadata?.budget_breakdown && m.metadata.budget_breakdown.total > 0 && (
                  <div className="glass p-2.5 rounded-xl border border-white/10">
                    <div className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-safe" /> Estimated Budget Breakdown (Approx.)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-xs">
                      <div className="glass px-2 py-1 rounded-lg">
                        <span className="text-[10px] text-muted-foreground block">Transit</span>
                        <span className="font-semibold text-foreground">₹{m.metadata.budget_breakdown.transport}</span>
                      </div>
                      <div className="glass px-2 py-1 rounded-lg">
                        <span className="text-[10px] text-muted-foreground block">Food</span>
                        <span className="font-semibold text-foreground">₹{m.metadata.budget_breakdown.food}</span>
                      </div>
                      <div className="glass px-2 py-1 rounded-lg">
                        <span className="text-[10px] text-muted-foreground block">Stay</span>
                        <span className="font-semibold text-foreground">₹{m.metadata.budget_breakdown.stay}</span>
                      </div>
                      <div className="glass px-2 py-1 rounded-lg">
                        <span className="text-[10px] text-muted-foreground block">Activities</span>
                        <span className="font-semibold text-foreground">₹{m.metadata.budget_breakdown.activities}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommended Places cards */}
                {m.metadata?.recommended_places && m.metadata.recommended_places.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {m.metadata.recommended_places.map((place, pIdx) => (
                      <div key={pIdx} className="glass p-2.5 rounded-xl border border-white/10 text-xs">
                        <div className="font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" /> {place.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary-glow">
                            {place.category}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-[11px]">{place.highlight}</p>
                        {place.estimated_budget && (
                          <div className="mt-1 text-[10px] text-safe font-semibold">
                            Est. Budget: {place.estimated_budget}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Itinerary Preview & Optimizer buttons if itinerary present */}
                {m.itinerary && (
                  <div className="glass p-3 rounded-xl border border-primary/30 mt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="gradient-text flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {m.itinerary.destination} ({m.itinerary.duration})
                      </span>
                      <span className="text-safe font-bold">Total: ₹{m.itinerary.estimated_total_budget}</span>
                    </div>

                    <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1">
                      {m.itinerary.days.map((d) => (
                        <div key={d.day} className="glass px-2.5 py-1.5 rounded-lg text-xs">
                          <div className="font-semibold text-foreground flex justify-between">
                            <span>Day {d.day}: {d.title}</span>
                            <span className="text-muted-foreground font-normal">~₹{d.estimated_budget}</span>
                          </div>
                          <ul className="list-disc list-inside text-[11px] text-muted-foreground mt-1 space-y-0.5">
                            {d.activities.map((a, aIdx) => (
                              <li key={aIdx}>
                                <strong className="text-foreground">{a.name}</strong> ({a.duration}) - {a.reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Optimize Trip Actions */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-[10px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                        <SlidersHorizontal className="w-3 h-3" /> Optimize this itinerary:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          disabled={optimizing}
                          onClick={() => handleOptimize(i, "Make this trip cheaper by using public transit and local street eats")}
                          className="glass text-[11px] px-2 py-1 rounded-md hover:bg-white/15 transition flex items-center gap-1"
                        >
                          💰 Make Cheaper
                        </button>
                        <button
                          disabled={optimizing}
                          onClick={() => handleOptimize(i, "Make this itinerary less crowded and more peaceful")}
                          className="glass text-[11px] px-2 py-1 rounded-md hover:bg-white/15 transition flex items-center gap-1"
                        >
                          🧘 Less Crowded
                        </button>
                        <button
                          disabled={optimizing}
                          onClick={() => handleOptimize(i, "Add more authentic local food experiences and street food walks")}
                          className="glass text-[11px] px-2 py-1 rounded-md hover:bg-white/15 transition flex items-center gap-1"
                        >
                          🍲 More Food
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Follow-up / Suggestions chips */}
                {m.metadata?.suggestions && m.metadata.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.metadata.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => send(sug)}
                        className="glass text-[11px] px-2.5 py-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/15 transition border border-white/10"
                      >
                        ⚡ {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-secondary/30 grid place-items-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center text-xs text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-gradient-pink-blue grid place-items-center shrink-0">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <span className="glass px-3 py-1.5 rounded-full border border-white/10">
                YatraBot is consulting Groq AI & price truth records...
              </span>
            </motion.div>
          )}

          {optimizing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center text-xs text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-gradient-sunset grid place-items-center shrink-0">
                <RefreshCw className="w-4 h-4 text-white animate-spin" />
              </div>
              <span className="glass px-3 py-1.5 rounded-full border border-white/10">
                Optimizing itinerary with Groq intelligence...
              </span>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-3 pt-2 border-t border-white/10 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask about prices, scams, 3-day itinerary, ₹5000 budget… / कीमतें पूछें / দাম জানুন"
            className="flex-1 glass px-4 py-3 text-sm bg-transparent rounded-xl outline-none focus:ring-1 focus:ring-primary/50 transition"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || optimizing || !input.trim()}
            className="bg-gradient-pink-blue text-white px-5 rounded-xl disabled:opacity-50 hover:opacity-95 transition shadow-glow-pink flex items-center justify-center"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
