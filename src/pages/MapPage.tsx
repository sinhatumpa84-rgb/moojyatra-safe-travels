import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ShieldAlert, Users, AlertTriangle, MapPin, CloudSun } from "lucide-react";

// Default Leaflet icon fix
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });

const colorIcon = (color: string) => L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:grid;place-items:center;color:white;font-weight:700;">●</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function Recenter({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(pos, 12); }, [pos, map]);
  return null;
}

export default function MapPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [pos, setPos] = useState<[number, number]>([28.6139, 77.2090]); // Delhi default
  const [weather, setWeather] = useState<any>(null);
  const [filters, setFilters] = useState({ scam: true, guides: true, cities: true });

  useEffect(() => {
    supabase.from("scam_zones").select("*").then(({ data }) => setZones(data || []));
    supabase.from("guides").select("*, cities(name, lat, lng)").then(({ data }) => setGuides(data || []));
    supabase.from("cities").select("*").then(({ data }) => setCities(data || []));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setPos([p.coords.latitude, p.coords.longitude]),
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos[0]}&longitude=${pos[1]}&current=temperature_2m,weather_code,wind_speed_10m`)
      .then(r => r.json()).then(setWeather).catch(() => {});
  }, [pos]);

  const riskColor = (r: string) => r === "high" ? "#ef4444" : r === "medium" ? "#f59e0b" : "#fbbf24";

  return (
    <div className="container px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><MapPin className="text-primary" /> Live Scam Map</h1>
          <p className="text-sm text-muted-foreground">Toggle layers · click markers for details</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {([["scam", "Scam zones", AlertTriangle, "bg-red-500/20 text-red-300"], ["guides", "Guides", Users, "bg-blue-500/20 text-blue-300"], ["cities", "Cities", MapPin, "bg-pink-500/20 text-pink-300"]] as const).map(([k, lbl, Icon, cls]) => (
            <button key={k} onClick={() => setFilters((f) => ({ ...f, [k]: !f[k as keyof typeof f] }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium glass ${filters[k as keyof typeof filters] ? cls : "opacity-50"}`}>
              <Icon className="w-4 h-4" /> {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="glass-strong p-2 h-[70vh]">
          <MapContainer center={pos} zoom={12} className="w-full h-full rounded-xl">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <Recenter pos={pos} />
            <Marker position={pos} icon={colorIcon("#FF6B81")}>
              <Popup>You are here</Popup>
            </Marker>
            {filters.scam && zones.map((z) => (
              <div key={z.id}>
                <Circle center={[z.lat, z.lng]} radius={z.radius_m} pathOptions={{ color: riskColor(z.risk_level), fillOpacity: 0.2 }} />
                <Marker position={[z.lat, z.lng]} icon={colorIcon(riskColor(z.risk_level))}>
                  <Popup>
                    <strong>⚠️ {z.name}</strong><br />
                    Risk: <b>{z.risk_level}</b><br />
                    {z.description}
                  </Popup>
                </Marker>
              </div>
            ))}
            {filters.guides && guides.map((g) => g.cities && (
              <Marker key={g.id} position={[g.cities.lat + 0.01, g.cities.lng + 0.01]} icon={colorIcon("#4D96FF")}>
                <Popup>
                  <strong>👤 {g.name}</strong><br />
                  ⭐ {g.rating} · ₹{g.hourly_rate}/hr<br />
                  {g.languages?.join(", ")}
                </Popup>
              </Marker>
            ))}
            {filters.cities && cities.map((c) => (
              <Marker key={c.id} position={[c.lat, c.lng]} icon={colorIcon("#9D4EDD")}>
                <Popup><strong>📍 {c.name}</strong><br />{c.state}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-strong p-5">
            <div className="flex items-center gap-2 mb-2">
              <CloudSun className="text-warn" />
              <h3 className="font-bold">Weather here</h3>
            </div>
            {weather?.current ? (
              <>
                <div className="text-4xl font-bold gradient-text">{Math.round(weather.current.temperature_2m)}°C</div>
                <div className="text-xs text-muted-foreground">Wind {weather.current.wind_speed_10m} km/h</div>
              </>
            ) : <div className="text-sm text-muted-foreground">Loading…</div>}
          </motion.div>

          <div className="glass-strong p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><ShieldAlert className="text-destructive w-4 h-4" /> Scam zones nearby</h3>
            <ul className="space-y-2 text-sm max-h-72 overflow-auto">
              {zones.slice(0, 8).map((z) => (
                <li key={z.id} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5" style={{ background: riskColor(z.risk_level) }} />
                  <div>
                    <div className="font-medium">{z.name}</div>
                    <div className="text-xs text-muted-foreground">{z.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
