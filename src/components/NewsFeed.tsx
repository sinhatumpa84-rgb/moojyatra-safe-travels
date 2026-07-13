import { useEffect, useState, useRef } from "react";
import { Newspaper, ExternalLink, AlertTriangle } from "lucide-react";

type Item = { title: string; link: string; pubDate: string; source: string };

// Google News RSS via rss2json (free, no key, CORS-enabled)
const TOPICS = [
  { key: "scam", label: "Scam", q: "tourist+scam+India" },
  { key: "crime", label: "Crime", q: "crime+India+tourist" },
  { key: "safety", label: "Women Safety", q: "women+safety+India" },
];

export default function NewsFeed({ city }: { city?: string }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setItems([]);

    const q = city ? `${topic.q}+${encodeURIComponent(city)}` : topic.q;
    const rss = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;

    const signal = abortControllerRef.current?.signal;

    (async () => {
      try {
        // Primary: rss2json (easy JSON parse)
        const r = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`,
          { signal }
        );

        if (r.ok) {
          const d = await r.json();
          if (d.status !== "error" && Array.isArray(d.items)) {
            const list: Item[] = (d.items || []).slice(0, 8).map((i: any) => ({
              title: i.title,
              link: i.link,
              pubDate: i.pubDate,
              source: (i.title.split(" - ").pop() || "").trim(),
            }));
            setItems(list);
            setError(null);
            return;
          }
        }

        // Fallback: fetch raw RSS via AllOrigins and parse XML client-side
        const raw = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rss)}`, { signal });
        if (!raw.ok) throw new Error("Failed to fetch RSS feed");
        const xmlText = await raw.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, "application/xml");
        const xmlItems = Array.from(doc.getElementsByTagName("item")).slice(0, 8);
        const list: Item[] = xmlItems.map((it: Element) => {
          const title = it.getElementsByTagName("title")[0]?.textContent || "";
          const link = it.getElementsByTagName("link")[0]?.textContent || "";
          const pubDate = it.getElementsByTagName("pubDate")[0]?.textContent || "";
          const sourceTag = it.getElementsByTagName("source")[0];
          const source = sourceTag ? sourceTag.textContent || "" : (title.split(" - ").pop() || "").trim();
          return { title, link, pubDate, source };
        });

        setItems(list);
        setError(null);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError("Could not load news");
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [topic, city]);

  return (
    <div className="glass-strong p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary" />
          Live news {city ? `· ${city}` : "· India"}
        </h3>
        <div className="flex gap-1">
          {TOPICS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTopic(t)}
              className={`text-[11px] px-2 py-1 rounded-md transition ${
                topic.key === t.key
                  ? "bg-primary text-primary-foreground"
                  : "glass hover:bg-white/15"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mb-3 text-balance">
        Aggregated in real-time from various local and national publishers.
      </div>
      {loading ? (
        <div
          className="space-y-2"
          aria-busy="true"
          aria-label="Loading news"
        >
          {[100, 85, 92, 78, 88].map((w, i) => (
            <div key={i} className="glass p-3 space-y-2">
              <div className={`skeleton h-3.5`} style={{ width: `${w}%` }} />
              <div className="skeleton h-3" style={{ width: "55%" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>{error}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> No news available for this search.
        </div>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-auto pr-1">
          {items.map((i) => (
            <li key={i.link}>
              <a
                href={i.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block glass p-3 text-sm hover:bg-white/15 transition group"
              >
                <div className="font-medium leading-snug group-hover:text-primary-glow line-clamp-2">
                  {i.title.replace(` - ${i.source}`, "")}
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span>{i.source}</span>
                  <span className="flex items-center gap-1">
                    {new Date(i.pubDate).toLocaleString()}{" "}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
