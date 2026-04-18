import { useEffect, useState } from "react";
import { CloudSun, Wind, Droplets } from "lucide-react";

const WMO: Record<number, string> = {
  0: "Clear ☀️", 1: "Mostly clear 🌤", 2: "Partly cloudy ⛅", 3: "Overcast ☁️",
  45: "Fog 🌫", 48: "Fog 🌫", 51: "Drizzle 🌦", 53: "Drizzle 🌦", 55: "Drizzle 🌦",
  61: "Rain 🌧", 63: "Rain 🌧", 65: "Heavy rain 🌧", 71: "Snow 🌨", 73: "Snow 🌨",
  80: "Showers 🌦", 81: "Showers 🌦", 82: "Heavy showers ⛈", 95: "Thunderstorm ⛈",
};

export default function WeatherWidget({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  const [w, setW] = useState<any>(null);
  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=4&timezone=auto`)
      .then((r) => r.json()).then(setW).catch(() => {});
  }, [lat, lng]);

  if (!w?.current) return <div className="glass-strong p-5 text-sm text-muted-foreground">Loading weather…</div>;

  const c = w.current;
  return (
    <div className="glass-strong p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CloudSun className="text-warn w-5 h-5" />
          <h3 className="font-bold">Weather {label ? `· ${label}` : "near you"}</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">Open-Meteo · live</span>
      </div>
      <div className="flex items-end gap-4">
        <div className="text-5xl font-bold gradient-text leading-none">{Math.round(c.temperature_2m)}°</div>
        <div className="text-sm">
          <div>{WMO[c.weather_code] || "—"}</div>
          <div className="text-xs text-muted-foreground">Feels {Math.round(c.apparent_temperature)}°C</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
        <div className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-secondary" /> {c.wind_speed_10m} km/h</div>
        <div className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-secondary" /> {c.relative_humidity_2m}%</div>
      </div>
      {w.daily && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {w.daily.time.slice(0, 4).map((d: string, i: number) => (
            <div key={d} className="glass p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{i === 0 ? "Today" : new Date(d).toLocaleDateString(undefined, { weekday: "short" })}</div>
              <div className="text-sm font-semibold">{Math.round(w.daily.temperature_2m_max[i])}°<span className="text-muted-foreground text-xs">/{Math.round(w.daily.temperature_2m_min[i])}°</span></div>
              <div className="text-xs">{(WMO[w.daily.weather_code[i]] || "").split(" ").pop()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
