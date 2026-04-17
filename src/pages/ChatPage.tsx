import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { detectLang, Lang } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS: Record<Lang, string[]> = {
  en: ["What's the real auto fare in Delhi?", "Common Taj Mahal scams?", "I was overcharged — what law applies?"],
  hi: ["दिल्ली में ऑटो का असली किराया?", "ताजमहल पर आम धोखे?", "मुझसे ज़्यादा पैसे लिए — कानून क्या कहता है?"],
  bn: ["দিল্লিতে অটোর সঠিক ভাড়া?", "তাজমহলে সাধারণ প্রতারণা?", "আমার থেকে বেশি নিয়েছে — আইন কী বলে?"],
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const detected = detectLang(text);
    setLang(detected);
    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yatrabot`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [...messages, userMsg], language: detected }),
      });

      if (resp.status === 429) { upsert("Rate limit reached, try again in a moment."); setLoading(false); return; }
      if (resp.status === 402) { upsert("AI credits exhausted. Add credits in Lovable workspace."); setLoading(false); return; }
      if (!resp.ok || !resp.body) { upsert("Connection failed."); setLoading(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "", done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || !line.trim()) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e) {
      upsert("Network error.");
    }
    setLoading(false);
  };

  return (
    <div className="container px-4 py-6 max-w-3xl">
      <h1 className="text-4xl font-bold flex items-center gap-2 mb-1"><Bot className="text-primary" /> YatraBot</h1>
      <p className="text-muted-foreground mb-4">Ask in English, हिन्दी or বাংলা — it auto-detects.</p>

      <div className="glass-strong p-4 flex flex-col h-[68vh]">
        <div ref={scrollRef} className="flex-1 overflow-auto space-y-3 pr-1">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">Try:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS[lang].map((s) => (
                  <button key={s} onClick={() => send(s)} className="glass text-xs px-3 py-1.5 hover:bg-white/15">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && <div className="w-8 h-8 rounded-lg bg-gradient-pink-blue grid place-items-center shrink-0"><Bot className="w-4 h-4 text-white" /></div>}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary/30 text-foreground" : "glass"}`}>
                {m.content || (loading && i === messages.length - 1 ? "…" : "")}
              </div>
              {m.role === "user" && <div className="w-8 h-8 rounded-lg bg-secondary/30 grid place-items-center shrink-0"><User className="w-4 h-4" /></div>}
            </motion.div>
          ))}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-pink-blue grid place-items-center"><Loader2 className="w-4 h-4 text-white animate-spin" /></div></div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask about prices, scams, laws… / कीमतें पूछें / দাম জিজ্ঞাসা করুন"
            className="flex-1 glass px-4 py-3 text-sm bg-transparent"
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="bg-gradient-pink-blue text-white px-4 rounded-lg disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
