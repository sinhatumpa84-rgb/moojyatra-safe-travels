import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles, Camera, Trophy, Loader2, Navigation, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  distance: number;
  wiki?: { extract: string; thumb?: string };
};

const TYPE_LABEL: Record<string, string> = {
  attraction: "🎡 Attraction", monument: "🏛 Monument", museum: "🖼 Museum",
  viewpoint: "🌄 Viewpoint", temple: "🛕 Temple", fort: "🏰 Fort", artwork: "🎨 Artwork",
  archaeological_site: "⛩ Heritage", castle: "🏰 Castle",
};

function distM(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

export default function NearbyPlacesPage() {
  const [pos, setPos] = useState<[number, number]>([28.6139, 77.2090]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [visited, setVisited] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("mooj_visited") || "[]")); } catch { return new Set(); }
  });
  const [points, setPoints] = useState(() => Number(localStorage.getItem("mooj_points") || "0"));

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setPos([p.coords.latitude, p.coords.longitude]),
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  const fetchNearby = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const radius = 8000;
      const q = `[out:json][timeout:25];(
        node["tourism"~"attraction|museum|viewpoint|artwork"](around:${radius},${lat},${lng});
        node["historic"~"monument|memorial|castle|fort|archaeological_site"](around:${radius},${lat},${lng});
        node["amenity"="place_of_worship"](around:${radius},${lat},${lng});
      );out body 60;`;
      const r = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST", body: "data=" + encodeURIComponent(q),
      });
      const d = await r.json();
      const list: Place[] = (d.elements || [])
        .filter((e: any) => e.tags?.name)
        .map((e: any) => ({
          id: String(e.id),
          name: e.tags.name,
          lat: e.lat, lng: e.lon,
          type: e.tags.tourism || e.tags.historic || (e.tags.amenity === "place_of_worship" ? "temple" : "attraction"),
          distance: distM([lat, lng], [e.lat, e.lon]),
        }))
        .sort((a: Place, b: Place) => a.distance - b.distance)
        .slice(0, 30);

      // Wikipedia summary in parallel (best-effort, top 12)
      await Promise.all(list.slice(0, 12).map(async (p) => {
        try {
          const wr = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.name)}`);
          if (wr.ok) {
            const w = await wr.json();
            if (w.extract) p.wiki = { extract: w.extract, thumb: w.thumbnail?.source };
          }
        } catch { /* ignore */ }
      }));

      setPlaces(list);
      if (list.length === 0) toast.info("No tourist spots found nearby. Try a city search.");
    } catch (e) {
      toast.error("Couldn't load places. Retry?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNearby(pos[0], pos[1]); }, [pos]);

  const searchCity = async () => {
    if (!city.trim()) return;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ", India")}&limit=1`);
      const d = await r.json();
      if (d?.[0]) {
        setPos([Number(d[0].lat), Number(d[0].lon)]);
        toast.success(`Loaded ${d[0].display_name}`);
      } else toast.error("City not found");
    } catch { toast.error("Search failed"); }
  };

  const checkIn = async (p: Place) => {
    if (visited.has(p.id)) { toast.info("Already checked in here"); return; }
    const next = new Set(visited); next.add(p.id);
    const newPoints = points + 25;
    setVisited(next); setPoints(newPoints);
    localStorage.setItem("mooj_visited", JSON.stringify([...next]));
    localStorage.setItem("mooj_points", String(newPoints));
    toast.success(`+25 points · ${p.name} ✨`);

    // Sync to backend if logged in
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("profiles").update({ points: newPoints }).eq("user_id", u.user.id);
    }
  };

  return (
    <div className="container px-4 py-6">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="text-primary" /> Nearby Places to Visit</h1>
          <p className="text-sm text-muted-foreground">Famous spots within 8 km · Check in to earn points</p>
        </div>
        <div className="glass-strong px-4 py-2 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warn" />
          <span className="font-bold gradient-text">{points} pts</span>
          <span className="text-xs text-muted-foreground">· {visited.size} visited</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <div className="glass-strong flex items-center gap-2 px-3 py-2 flex-1 min-w-[260px]">
          <Navigation className="w-4 h-4 text-secondary" />
          <input value={city} onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchCity()}
            placeholder="Search any Indian city or landmark…"
            className="bg-transparent outline-none flex-1 text-sm" />
          <button onClick={searchCity} className="text-xs bg-gradient-pink-blue text-white px-3 py-1.5 rounded-lg font-semibold">Search</button>
        </div>
        <button onClick={() => navigator.geolocation?.getCurrentPosition((p) => setPos([p.coords.latitude, p.coords.longitude]))}
          className="glass-strong px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/15">
          <MapPin className="w-4 h-4" /> My location
        </button>
      </div>

      {loading ? (
        <div className="glass-strong p-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          <div className="text-sm text-muted-foreground mt-3">Discovering famous places…</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-strong overflow-hidden flex flex-col">
              {p.wiki?.thumb ? (
                <img src={p.wiki.thumb} alt={p.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary/30 via-purple-500/20 to-secondary/30 grid place-items-center">
                  <Camera className="w-10 h-10 text-white/60" />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold leading-tight">{p.name}</h3>
                  {visited.has(p.id) && <Star className="w-4 h-4 text-warn fill-warn flex-shrink-0" />}
                </div>
                <div className="text-xs text-muted-foreground mb-2">{TYPE_LABEL[p.type] || "📍 Place"} · {(p.distance / 1000).toFixed(1)} km</div>
                <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{p.wiki?.extract || "A noteworthy spot near you. Visit and tell us about it."}</p>
                <div className="flex gap-2 mt-3">
                  <a href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=18/${p.lat}/${p.lng}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center text-xs glass py-2 hover:bg-white/15">Directions</a>
                  <button onClick={() => checkIn(p)} disabled={visited.has(p.id)}
                    className={`flex-1 text-xs font-semibold py-2 rounded-xl transition ${visited.has(p.id) ? "bg-safe/20 text-safe" : "bg-gradient-pink-blue text-white hover:scale-[1.02]"}`}>
                    {visited.has(p.id) ? "✓ Visited" : "Check in +25"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
