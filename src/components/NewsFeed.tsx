import { useEffect, useState } from "react";
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

  useEffect(() => {
    setLoading(true);
    const q = city ? `${topic.q}+${encodeURIComponent(city)}` : topic.q;
    const rss = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`)
      .then((r) => r.json())
      .then((d) => {
        const list: Item[] = (d.items || []).slice(0, 8).map((i: any) => ({
          title: i.title,
          link: i.link,
          pubDate: i.pubDate,
          source: (i.title.split(" - ").pop() || "").trim(),
        }));
        setItems(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topic, city]);

  return (
    <div className="glass-strong p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2"><Newspaper className="w-4 h-4 text-primary" /> Live news {city ? `· ${city}` : "· India"}</h3>
        <div className="flex gap-1">
          {TOPICS.map((t) => (
            <button key={t.key} onClick={() => setTopic(t)}
              className={`text-[11px] px-2 py-1 rounded-md transition ${topic.key === t.key ? "bg-primary text-primary-foreground" : "glass hover:bg-white/15"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading headlines…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> No news right now.</div>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-auto pr-1">
          {items.map((i) => (
            <li key={i.link}>
              <a href={i.link} target="_blank" rel="noopener noreferrer"
                className="block glass p-3 text-sm hover:bg-white/15 transition group">
                <div className="font-medium leading-snug group-hover:text-primary-glow line-clamp-2">{i.title.replace(` - ${i.source}`, "")}</div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span>{i.source}</span>
                  <span className="flex items-center gap-1">{new Date(i.pubDate).toLocaleString()} <ExternalLink className="w-3 h-3" /></span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
