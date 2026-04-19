import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, Users, AlertTriangle, MapPin, Navigation, Search, Crosshair, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import WeatherWidget from "@/components/WeatherWidget";
import NewsFeed from "@/components/NewsFeed";
import { usePresence } from "@/hooks/usePresence";
import { useAuth } from "@/hooks/useAuth";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });

const colorIcon = (color: string, label = "●") => L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:grid;place-items:center;color:white;font-weight:700;font-size:14px;">${label}</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function Recenter({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(pos, 12); setTimeout(() => map.invalidateSize(), 100); }, [pos, map]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (p: [number, number]) => void }) {
  useMapEvents({
    click: (e) => onPick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

export default function MapPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [pos, setPos] = useState<[number, number]>([28.6139, 77.2090]);
  const [pinMode, setPinMode] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string>("Delhi");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ scam: true, cities: true, travelers: true });
  const { user } = useAuth();
  const travelers = usePresence(pos, locationLabel, !!user);

  useEffect(() => {
    supabase.from("scam_zones").select("*").then(({ data }) => setZones(data || []));
    supabase.from("cities").select("*").then(({ data }) => setCities(data || []));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setPos([p.coords.latitude, p.coords.longitude]),
        () => {}, { timeout: 5000 }
      );
    }
  }, []);

  // Reverse geocode for label
  useEffect(() => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}&zoom=10`)
      .then((r) => r.json())
      .then((d) => {
        const a = d?.address || {};
        setLocationLabel(a.city || a.town || a.village || a.state || "this area");
      })
      .catch(() => {});
  }, [pos]);

  const onPickPin = (p: [number, number]) => {
    if (!pinMode) return;
    setPos(p);
    setPinMode(false);
    toast.success("📍 Location updated");
  };

  const doSearch = async () => {
    if (!search.trim()) return;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search + ", India")}&limit=1`);
      const d = await r.json();
      if (d?.[0]) { setPos([Number(d[0].lat), Number(d[0].lon)]); toast.success(`Loaded ${d[0].display_name.split(",")[0]}`); }
      else toast.error("Not found");
    } catch { toast.error("Search failed"); }
  };

  const riskColor = (r: string) => r === "high" ? "#ef4444" : r === "medium" ? "#f59e0b" : "#fbbf24";

  return (
    <div className="container px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><MapPin className="text-primary" /> Live Smart Map</h1>
          <p className="text-sm text-muted-foreground">Showing: <b>{locationLabel}</b> · Click 📍 then tap map to set location</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            ["scam", "Scam zones", AlertTriangle, "bg-destructive/20 text-destructive"],
            ["cities", "Cities", MapPin, "bg-primary/20 text-primary"],
            ["travelers", `Travelers (${travelers.length})`, UserCircle2, "bg-secondary/20 text-secondary"],
          ] as const).map(([k, lbl, Icon, cls]) => (
            <button key={k} onClick={() => setFilters((f) => ({ ...f, [k]: !f[k as keyof typeof f] }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium glass ${filters[k as keyof typeof filters] ? cls : "opacity-50"}`}>
              <Icon className="w-4 h-4" /> {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <div className="glass-strong flex items-center gap-2 px-3 py-2 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search city or address (e.g. Jaipur, India Gate)…"
            className="bg-transparent outline-none flex-1 text-sm" />
          <button onClick={doSearch} className="text-xs bg-gradient-pink-blue text-white px-3 py-1.5 rounded-lg font-semibold">Go</button>
        </div>
        <button onClick={() => setPinMode((v) => !v)}
          className={`px-4 py-2 text-sm rounded-xl flex items-center gap-2 transition ${pinMode ? "bg-warn text-warn-foreground font-bold" : "glass-strong hover:bg-white/15"}`}>
          <Crosshair className="w-4 h-4" /> {pinMode ? "Tap on map…" : "Manual pin"}
        </button>
        <button onClick={() => navigator.geolocation?.getCurrentPosition((p) => { setPos([p.coords.latitude, p.coords.longitude]); toast.success("Located"); })}
          className="glass-strong px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/15">
          <Navigation className="w-4 h-4" /> GPS
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        <div className={`glass-strong p-2 h-[65vh] ${pinMode ? "ring-2 ring-warn" : ""}`}>
          <MapContainer center={pos} zoom={12} className="w-full h-full rounded-xl" style={{ cursor: pinMode ? "crosshair" : "" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <Recenter pos={pos} />
            <ClickHandler onPick={onPickPin} />
            <Marker position={pos} icon={colorIcon("#FF6B81", "★")}>
              <Popup>You are here<br />{locationLabel}</Popup>
            </Marker>
            {filters.scam && zones.flatMap((z) => [
              <Circle key={`c-${z.id}`} center={[z.lat, z.lng]} radius={z.radius_m || 500} pathOptions={{ color: riskColor(z.risk_level), fillOpacity: 0.2 }} />,
              <Marker key={`m-${z.id}`} position={[z.lat, z.lng]} icon={colorIcon(riskColor(z.risk_level), "!")}>
                <Popup>
                  <strong>⚠️ {z.name}</strong><br />Risk: <b>{z.risk_level}</b><br />{z.description}
                </Popup>
              </Marker>,
            ])}
            {filters.cities && cities.map((c) => (
              <Marker key={c.id} position={[c.lat, c.lng]} icon={colorIcon("#9D4EDD")}>
                <Popup><strong>📍 {c.name}</strong><br />{c.state}</Popup>
              </Marker>
            ))}
            {filters.travelers && travelers.map((tr) => (
              <Marker key={tr.user_id} position={[tr.lat, tr.lng]} icon={colorIcon("#4D96FF", "🧳")}>
                <Popup>
                  <strong>🧳 {tr.display_name || "Traveler"}</strong><br />
                  {tr.city ? `Near ${tr.city}` : "Currently exploring"}<br />
                  <span style={{fontSize:11,opacity:0.7}}>Last seen {new Date(tr.updated_at).toLocaleTimeString()}</span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="space-y-4">
          <WeatherWidget lat={pos[0]} lng={pos[1]} label={locationLabel} />
          <div className="glass-strong p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><ShieldAlert className="text-destructive w-4 h-4" /> Scam zones</h3>
            <ul className="space-y-2 text-sm max-h-60 overflow-auto">
              {zones.slice(0, 8).map((z) => (
                <li key={z.id} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: riskColor(z.risk_level) }} />
                  <div><div className="font-medium">{z.name}</div><div className="text-xs text-muted-foreground">{z.description}</div></div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-6">
        <NewsFeed city={locationLabel} />
      </div>
    </div>
  );
}
