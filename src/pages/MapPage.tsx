import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, MapPin, Navigation, Search, Crosshair, Loader2, WifiOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import WeatherWidget from "@/components/WeatherWidget";
import NewsFeed from "@/components/NewsFeed";

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

const blueDotIcon = L.divIcon({
  className: "",
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-60"></div>
           <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function Recenter({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(pos, 13, { duration: 1.5 }); }, [pos, map]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (p: [number, number]) => void }) {
  useMapEvents({
    click: (e) => onPick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

// 2. Dynamic Area Reports: Listen to moveend to get bounding box (debounced)
function MapEventsListener({
  onBoundsChanged,
  onCenterChanged,
  onMoving,
}: {
  onBoundsChanged: (bounds: L.LatLngBounds) => void;
  onCenterChanged: (center: [number, number]) => void;
  onMoving: (moving: boolean) => void;
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const map = useMapEvents({
    movestart: () => onMoving(true),
    zoomstart: () => onMoving(true),
    moveend: () => {
      // Debounce so sidebars only refresh after user fully stops panning/zooming
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onBoundsChanged(map.getBounds());
        const center = map.getCenter();
        onCenterChanged([center.lat, center.lng]);
        onMoving(false);
      }, 400);
    },
    zoomend: () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onBoundsChanged(map.getBounds());
        onMoving(false);
      }, 400);
    },
  });

  useEffect(() => {
    onBoundsChanged(map.getBounds());
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [map, onBoundsChanged]);

  return null;
}

export default function MapPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [pos, setPos] = useState<[number, number]>([28.6139, 77.2090]); // Selected point
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null); // Live tracking
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [isMapMoving, setIsMapMoving] = useState(false); // tracks active panning
  const [pinMode, setPinMode] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("Delhi"); // Name of the selected point (pos)
  const [viewLabel, setViewLabel] = useState<string>("Delhi"); // Name of the current map center
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ scam: true, cities: true });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMobileLocModal, setShowMobileLocModal] = useState(false);
  // 1. GPS feature: track explicit permission denial so we can show a rich UI
  const [gpsError, setGpsError] = useState<"denied" | "unavailable" | null>(null);

  // use a ref to hold watchId so we can manage it
  const watchIdRef = useRef<number | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) return;
    let isFirstLoad = true;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
        if (isFirstLoad) {
          setPos([p.coords.latitude, p.coords.longitude]);
          setMapCenter([p.coords.latitude, p.coords.longitude]);
          isFirstLoad = false;
        }
      },
      () => {}, 
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
  };

  useEffect(() => {
    supabase.from("scam_zones").select("*").then(({ data }) => setZones(data || []));
    supabase.from("cities").select("*").then(({ data }) => setCities(data || []));
    
    // Google Maps Style Live Tracking
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasPrompted = localStorage.getItem("moojyatra_loc_prompted");

    // Helper to decide if we show the soft-prompt or go straight to native GPS tracking
    const tryInitTracking = () => {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((res) => {
          if (res.state === "granted") {
            startTracking(); // already permitted in OS, start tracking
          } else if (res.state === "prompt" && isMobile && !hasPrompted) {
            setShowMobileLocModal(true); // soft prompt first for mobile
          } else if (res.state === "prompt") {
            startTracking(); // on desktop, just trigger native prompt automatically
          }
        }).catch(() => {
          // Fallback if permissions API fails
          if (isMobile && !hasPrompted) setShowMobileLocModal(true);
          else startTracking();
        });
      } else {
        // Fallback for Safari/browsers without permissions API
        if (isMobile && !hasPrompted) setShowMobileLocModal(true);
        else startTracking();
      }
    };

    tryInitTracking();

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // Reverse geocode for the Selected Pin (pos)
  useEffect(() => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}&zoom=10`)
      .then((r) => r.json())
      .then((d) => {
        const a = d?.address || {};
        setSelectedLabel(a.city || a.town || a.village || a.state || "this area");
      })
      .catch(() => {});
  }, [pos]);

  // Reverse geocode for the View Center (mapCenter)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapCenter[0]}&lon=${mapCenter[1]}&zoom=10`)
        .then((r) => r.json())
        .then((d) => {
          const a = d?.address || {};
          setViewLabel(a.city || a.town || a.village || a.state || "this area");
        })
        .catch(() => {});
    }, 1000); // debounce API calls
    return () => clearTimeout(timer);
  }, [mapCenter]);

  // Filter zones dynamically by bounding box
  const visibleZones = useMemo(() => {
    if (!mapBounds) return zones;
    return zones.filter((z) => mapBounds.contains([z.lat, z.lng]));
  }, [zones, mapBounds]);

  const onPickPin = (p: [number, number]) => {
    if (!pinMode) return;
    setPos(p);
    setPinMode(false);
    toast.success("📍 Checked area updated");
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

  // 1. Mobile Geolocation implementation with rich error state
  const handleGPS = () => {
    // If we're already tracking them, just instantly fly there without reloading
    if (userLocation) {
      setPos([userLocation.lat, userLocation.lng]);
      toast.success("📍 Recentered to your live location");
      return;
    }

    if (!navigator.geolocation) {
      setGpsError("unavailable");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const newLoc = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
        setUserLocation(newLoc);
        setPos([p.coords.latitude, p.coords.longitude]);
        setGpsLoading(false);
        setGpsError(null);
        // Also start continuous tracking now that we have permission
        startTracking();
        toast.success("📍 Located your live position");
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("denied"); // Show rich permission-denied UI
        } else {
          setGpsError("unavailable");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const retryGps = () => {
    setGpsError(null);
    handleGPS();
  };

  const riskColor = (r: string) => r === "high" ? "#ef4444" : r === "medium" ? "#f59e0b" : "#fbbf24";

  return (
    <div className="container px-4 py-6">
      {/* Mobile Location Soft Prompt Modal */}
      {showMobileLocModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="glass-strong p-6 max-w-sm w-full rounded-2xl flex flex-col gap-4 text-center items-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
              <Navigation className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold">Use your location?</h2>
            <p className="text-sm text-muted-foreground">
              MooJYatra uses your location to track your safety, show live weather, and alert you of nearby scam zones.
            </p>
            <div className="flex flex-col gap-2 w-full mt-4">
              <button onClick={() => {
                localStorage.setItem('moojyatra_loc_prompted', 'true');
                setShowMobileLocModal(false);
                startTracking();
              }} className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 rounded-xl transition">
                Allow Location
              </button>
              <button onClick={() => {
                localStorage.setItem('moojyatra_loc_prompted', 'true');
                setShowMobileLocModal(false);
                toast.success("Location disabled. Displaying default map area.");
              }} className="w-full glass py-3 font-medium rounded-xl transition hover:bg-white/10">
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><MapPin className="text-primary" /> Live Smart Map</h1>
          <p className="text-sm text-muted-foreground">Showing Map Area: <b>{viewLabel}</b> · Click 📍 then tap map to search</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {([["scam", "Scam zones", AlertTriangle, "bg-destructive/20 text-destructive"], ["cities", "Cities", MapPin, "bg-primary/20 text-primary"]] as const).map(([k, lbl, Icon, cls]) => (
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
        <button onClick={handleGPS} disabled={gpsLoading}
          className={`glass-strong px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50 transition-all ${
            userLocation && !gpsLoading
              ? "gps-active border border-secondary/60 text-secondary font-semibold"
              : "hover:bg-white/15"
          }`}>
          {gpsLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Navigation className={`w-4 h-4 ${userLocation ? "text-secondary" : ""}`} />
          }
          {gpsLoading ? "Locating…" : userLocation ? "📡 Live" : "Live GPS"}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        {/* 1. GPS Error: Rich permission-denied modal overlay */}
        <AnimatePresence>
          {gpsError && (
            <motion.div
              key="gps-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 glass-strong border border-destructive/40 rounded-xl p-4 flex gap-3 items-start"
            >
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <WifiOff className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                {gpsError === "denied" ? (
                  <>
                    <p className="font-semibold text-sm text-destructive">Location Permission Denied</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      MooJYatra needs your location to show nearby scam zones and alerts.
                      Please enable it in your <strong>browser settings</strong> (usually the 🔒 lock icon in the address bar)
                      then tap Retry below.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={retryGps}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition">
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                      </button>
                      <button onClick={() => setGpsError(null)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 glass rounded-lg font-medium hover:bg-white/15 transition">
                        Dismiss
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-sm text-destructive">Location Unavailable</p>
                    <p className="text-xs text-muted-foreground mt-1">Could not determine your position. Check your device GPS and try again.</p>
                    <button onClick={retryGps}
                      className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition">
                      <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                  </>
                )}
              </div>
              <button onClick={() => setGpsError(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`glass-strong p-2 h-[65vh] relative overflow-hidden ${pinMode ? "ring-2 ring-warn" : ""}`}>
          {/* 2. Dynamic Area: subtle "Updating area..." badge while map is moving */}
          <AnimatePresence>
            {isMapMoving && (
              <motion.div
                key="area-updating"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-sm border border-white/10 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg pointer-events-none"
              >
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                Updating area data…
              </motion.div>
            )}
          </AnimatePresence>

          <MapContainer 
            center={pos} 
            zoom={13} 
            className="w-full h-full rounded-xl relative overflow-hidden z-10" 
            style={{
              cursor: pinMode ? "crosshair" : "",
              // Reinforcement for Safari/WebKit which can ignore the CSS class touch-action
              touchAction: "none",
            }}
            // 3. Scroll/Pan Sensitivity: smooth & deliberate feel on mobile + desktop
            wheelDebounceTime={200}       // ms to wait before firing zoom (reduces jumpiness)
            wheelPxPerZoomLevel={80}      // pixels of scroll per zoom step (higher = slower zoom)
            zoomDelta={0.5}               // fractional zoom per step for smooth increments
            zoomSnap={0.25}               // allow quarter-zoom snapping for more granular control
            inertia={true}                // enable inertia for smooth deceleration after drag
            inertiaDeceleration={1500}    // lower = longer coasting; default 3000
            inertiaMaxSpeed={800}         // cap velocity so fast swipes don't overshoot
            easeLinearity={0.2}           // smaller = smoother easing curve on animation
            touchZoom={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <Recenter pos={pos} />
            <ClickHandler onPick={onPickPin} />
            <MapEventsListener
              onBoundsChanged={(bounds) => setMapBounds(bounds)}
              onCenterChanged={(center) => setMapCenter(center)}
              onMoving={(moving) => setIsMapMoving(moving)}
            />
            
            {/* Google Maps style tracking dot */}
            {userLocation && (
              <>
                <Circle 
                  center={[userLocation.lat, userLocation.lng]} 
                  radius={userLocation.accuracy} 
                  pathOptions={{ fillOpacity: 0.15, fillColor: "#3b82f6", color: "#3b82f6", weight: 1, interactive: false }} 
                />
                <Marker position={[userLocation.lat, userLocation.lng]} icon={blueDotIcon} zIndexOffset={1000}>
                  <Popup>Current Live Position</Popup>
                </Marker>
              </>
            )}

            {/* General selected target pin (from search or manual map tap) */}
            <Marker position={pos} icon={colorIcon("#FF6B81", "★")}>
              <Popup>Selected area: <b>{selectedLabel}</b></Popup>
            </Marker>
            {filters.scam && zones.map((z) => (
              <div key={z.id}>
                <Circle center={[z.lat, z.lng]} radius={z.radius_m} pathOptions={{ color: riskColor(z.risk_level), fillOpacity: 0.2 }} />
                <Marker position={[z.lat, z.lng]} icon={colorIcon(riskColor(z.risk_level), "!")}>
                  <Popup>
                    <strong>⚠️ {z.name}</strong><br />Risk: <b>{z.risk_level}</b><br />{z.description}
                  </Popup>
                </Marker>
              </div>
            ))}
            {filters.cities && cities.map((c) => (
              <Marker key={c.id} position={[c.lat, c.lng]} icon={colorIcon("#9D4EDD")}>
                <Popup><strong>📍 {c.name}</strong><br />{c.state}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        {/* end map panel */}

        <aside className="space-y-4">
          {/* Ensure Weather explicitly targets the locked red pin (Live or Searched) */}
          <WeatherWidget lat={pos[0]} lng={pos[1]} label={selectedLabel} />
          
          <div className="glass-strong p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><ShieldAlert className="text-destructive w-4 h-4" /> Scam zones nearby</h3>
            <ul className="space-y-2 text-sm max-h-[300px] overflow-auto pr-1">
              {visibleZones.length === 0 ? (
                <li className="text-muted-foreground text-xs">No known scam zones in {viewLabel}... Safe travels!</li>
              ) : (
                visibleZones.slice(0, 10).map((z) => (
                  <li key={z.id} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: riskColor(z.risk_level) }} />
                    <div><div className="font-medium leading-tight">{z.name}</div><div className="text-[11px] text-muted-foreground mt-0.5">{z.description}</div></div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-6">
        {/* 2. Dynamic Area Reports: NewsFeed follows the live MAP VIEW (viewLabel),
            not the static selected pin, so it refreshes as the user pans around */}
        <NewsFeed city={viewLabel} />
      </div>
    </div>
  );
}
