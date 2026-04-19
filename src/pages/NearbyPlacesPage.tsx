import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sparkles, Camera, Trophy, Loader2, Navigation, Star, Upload, X, MapPinOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

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

  // Check-In Modal State
  const [checkInPlace, setCheckInPlace] = useState<Place | null>(null);
  const [photoBlob, setPhotoBlob] = useState<string | null>(null);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (p) => setPos([p.coords.latitude, p.coords.longitude]),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
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

  // Only trigger massive overpass API fetch when map fundamentally jumps long distances
  const lastFetched = useRef<[number, number] | null>(null);
  useEffect(() => { 
    if (!lastFetched.current || distM(lastFetched.current, pos) > 4000) {
      lastFetched.current = pos;
      fetchNearby(pos[0], pos[1]); 
    }
  }, [pos]);

  const searchCity = async () => {
    if (!city.trim()) return;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ", India")}&limit=1`);
      const d = await r.json();
      if (d?.[0]) {
        setPos([Number(d[0].lat), Number(d[0].lon)]);
        toast.success(`Scanning places around ${d[0].display_name.split(",")[0]}`);
      } else toast.error("City not found");
    } catch { toast.error("Search failed"); }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setPhotoBlob(URL.createObjectURL(e.target.files[0]));
  };

  const submitCheckIn = async () => {
    if (!checkInPlace) return;
    if (distM(pos, [checkInPlace.lat, checkInPlace.lng]) > 500) {
      return toast.error("You must be within 500m of this location to check in.");
    }
    if (!photoBlob) {
      return toast.error("Please provide photographic proof of your visit.");
    }

    // Leaderboard + Points update
    const next = new Set(visited); next.add(checkInPlace.id);
    const newPoints = points + 25;
    
    setVisited(next); 
    setPoints(newPoints);
    localStorage.setItem("mooj_visited", JSON.stringify([...next]));
    localStorage.setItem("mooj_points", String(newPoints));
    
    // Trigger awesome micro-interaction
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6B81', '#3b82f6', '#10b981']
    });

    toast.success(
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-warn/20 flex items-center justify-center shrink-0">
          <Trophy className="w-6 h-6 text-warn" />
        </div>
        <div>
          <div className="font-bold text-base">+25 Points Earned!</div>
          <div className="text-xs text-muted-foreground">Checked into {checkInPlace.name}</div>
        </div>
      </div>,
      { duration: 4000 }
    );

    // Sync to backend if logged in
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      await supabase.from("profiles").update({ points: newPoints }).eq("user_id", u.user.id);
    }

    setCheckInPlace(null);
    setPhotoBlob(null);
    setReview("");
  };

  return (
    <div className="container px-4 py-6">
      
      {/* Proof of Visit Modal */}
      <AnimatePresence>
        {checkInPlace && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 text-left">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                className="glass-strong max-w-md w-full p-6 rounded-2xl relative shadow-soft border border-white/10 flex flex-col max-h-[90vh]">
              <button onClick={() => setCheckInPlace(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-white glass p-1 rounded-full"><X className="w-5 h-5"/></button>
              
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Camera className="text-primary" /> Proof of Visit</h2>
              <p className="text-sm text-muted-foreground mb-4">Validate your visit to <b>{checkInPlace.name}</b> to claim +25 points.</p>

              {/* Photo Upload Area */}
              <div className="mb-4">
                <label className="text-xs font-medium text-white/70 mb-2 block">Upload Verification Photo *</label>
                {photoBlob ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden glass">
                     <img src={photoBlob} alt="Preview" className="w-full h-full object-cover" />
                     <button onClick={() => setPhotoBlob(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full"><X className="w-4 h-4"/></button>
                  </div>
                ) : (
                  <label className="w-full h-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-white/5 transition group">
                    <Upload className="w-8 h-8 mb-2 group-hover:text-primary transition" />
                    <span className="text-sm">Tap or Drag to upload photo</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                )}
              </div>

              {/* Verification Review */}
              <div className="mb-4">
                <label className="text-xs font-medium text-white/70 mb-2 block">Proof of Visit Message (optional)</label>
                <textarea 
                  value={review} onChange={e => setReview(e.target.value)}
                  placeholder="Drop a tip or review for other travelers..."
                  className="w-full glass bg-transparent border border-white/10 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-primary/50" rows={3}></textarea>
              </div>

              {/* GPS Validation Logic Banner */}
              {distM(pos, [checkInPlace.lat, checkInPlace.lng]) > 500 ? (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl flex items-center gap-2 mb-4">
                  <MapPinOff className="w-5 h-5 shrink-0" />
                  <span><b>Too far away!</b> You are {(distM(pos, [checkInPlace.lat, checkInPlace.lng]) / 1000).toFixed(1)}km from the destination. You must be within 500m to verify.</span>
                </div>
              ) : (
                <div className="bg-safe/10 border border-safe/20 text-safe text-xs p-3 rounded-xl flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <span><b>GPS Match!</b> You are within the 500m verification radius.</span>
                </div>
              )}

              <button 
                onClick={submitCheckIn} 
                disabled={distM(pos, [checkInPlace.lat, checkInPlace.lng]) > 500 || !photoBlob}
                className="w-full bg-gradient-pink-blue text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:grayscale transition flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" /> Submit & Earn +25 Points
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="text-primary" /> Nearby Places to Visit</h1>
          <p className="text-sm text-muted-foreground">Famous spots within 8 km · Check in to earn leaderboard points</p>
        </div>
        <div className="glass-strong px-4 py-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warn" />
          <span className="font-bold gradient-text text-lg">{points} <span className="text-sm font-semibold opacity-80">pts</span></span>
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
        <div className="glass-strong p-12 text-center h-64 flex flex-col justify-center items-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          <div className="text-sm text-muted-foreground mt-3">Discovering famous places nearby…</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {places.map((p, i) => {
            const distanceM = distM(pos, [p.lat, p.lng]);
            const isNear = distanceM <= 500;
            const isVisited = visited.has(p.id);

            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="glass-strong overflow-hidden flex flex-col h-72 relative group rounded-2xl">
                
                {/* Full Card Background Image Strategy */}
                <div className="absolute inset-0 z-0 bg-background">
                  {p.wiki?.thumb ? (
                    <img src={p.wiki.thumb} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    // Fallback to a sophisticated geometric gradient if no image is available
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-primary/40 to-slate-900 grid place-items-center opacity-80 mix-blend-screen overflow-hidden">
                      <Camera className="w-24 h-24 text-white/10 absolute rotate-12 scale-150" />
                    </div>
                  )}
                  {/* Subtle Gradient Overlay so white text is always readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent"></div>
                </div>

                {/* Card Content Overlay */}
                <div className="relative z-10 p-4 h-full flex flex-col justify-end">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold leading-tight text-white line-clamp-2">{p.name}</h3>
                    {isVisited && <Star className="w-5 h-5 text-warn fill-warn flex-shrink-0 drop-shadow-md" />}
                  </div>
                  
                  <div className="text-[11px] font-medium text-white/80 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">{TYPE_LABEL[p.type] || "📍 Place"}</span>
                    <span>· {(distanceM / 1000).toFixed(1)} km</span>
                  </div>
                  
                  <p className="text-xs text-white/70 line-clamp-2 flex-1 mb-3">{p.wiki?.extract || "A highly rated noteworthy destination. Visit to document and review your experience."}</p>
                  
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`)} 
                      className="w-10 flex shrink-0 items-center justify-center text-xs glass bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition">
                      <Navigation className="w-4 h-4"/>
                    </button>
                    
                    <button onClick={() => setCheckInPlace(p)} disabled={isVisited}
                      className={`flex-1 text-sm font-bold py-2.5 rounded-xl transition-all ${
                        isVisited 
                          ? "bg-safe/20 text-safe backdrop-blur-md cursor-default" 
                          : isNear
                            ? "bg-safe text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse hover:bg-green-400"
                            : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/5"
                      }`}>
                      {isVisited ? "✓ Completed" : (isNear ? "Check in +25" : "Check in +25")}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
