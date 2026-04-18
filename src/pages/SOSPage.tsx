import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Phone, MapPin, Share2, CheckSquare, Square, Search, Globe, Copy, AlertOctagon, Heart } from "lucide-react";
import { toast } from "sonner";
import { EMBASSIES } from "@/lib/embassies";

const EMERGENCY = [
  { name: "Universal Emergency", num: "112", color: "from-red-500 to-orange-500", icon: "🚨" },
  { name: "Women Helpline", num: "1091", color: "from-pink-500 to-purple-500", icon: "👩" },
  { name: "Police", num: "100", color: "from-blue-500 to-cyan-500", icon: "👮" },
  { name: "Tourist Helpline", num: "1363", color: "from-emerald-500 to-teal-500", icon: "🧳" },
  { name: "Ambulance", num: "102", color: "from-rose-500 to-red-500", icon: "🚑" },
  { name: "Fire", num: "101", color: "from-orange-500 to-red-500", icon: "🚒" },
  { name: "Child Helpline", num: "1098", color: "from-yellow-500 to-orange-500", icon: "🧒" },
  { name: "Cyber Crime", num: "1930", color: "from-violet-500 to-fuchsia-500", icon: "💻" },
  { name: "Disaster Mgmt", num: "108", color: "from-amber-500 to-orange-600", icon: "🌪" },
  { name: "Anti-Stalking", num: "1096", color: "from-pink-600 to-rose-500", icon: "🛡️" },
];

const CHECKLIST = [
  "Share live location with a trusted contact",
  "Note hotel address & nearest landmark",
  "Keep copy of passport & visa in cloud",
  "Save your embassy contact",
  "Avoid solo travel after dark in scam zones",
  "Use only prepaid taxi or app-based rides",
  "Carry small change to avoid 'no change' scam",
  "Keep emergency money in two separate places",
];

export default function SOSPage() {
  const [pos, setPos] = useState<GeolocationCoordinates | null>(null);
  const [sharing, setSharing] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("mooj_sos_checklist") || "[]")); } catch { return new Set(); }
  });
  const [emQuery, setEmQuery] = useState("");
  const [savedEmbassy, setSavedEmbassy] = useState<string | null>(() => localStorage.getItem("mooj_my_embassy"));

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => setPos(p.coords), () => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("mooj_sos_checklist", JSON.stringify([...checked]));
  }, [checked]);

  const triggerSOS = async () => {
    setSharing(true);
    if (!pos) { toast.error("Location unavailable. Allow GPS."); setSharing(false); return; }
    const url = `https://www.openstreetmap.org/?mlat=${pos.latitude}&mlon=${pos.longitude}#map=18/${pos.latitude}/${pos.longitude}`;
    const text = `🚨 SOS — I need help. My live location: ${url}`;

    if (navigator.share) {
      try { await navigator.share({ title: "SOS — MoojYatra", text, url }); toast.success("SOS shared"); }
      catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("SOS message copied — paste to a contact");
    }
    setSharing(false);
  };

  const callWhatsApp = () => {
    if (!pos) { toast.error("GPS off"); return; }
    const url = `https://wa.me/?text=${encodeURIComponent(`🚨 SOS — I need help. Location: https://www.openstreetmap.org/?mlat=${pos.latitude}&mlon=${pos.longitude}#map=18/${pos.latitude}/${pos.longitude}`)}`;
    window.open(url, "_blank");
  };

  const toggle = (i: number) => {
    const s = new Set(checked);
    if (s.has(i)) s.delete(i); else s.add(i);
    setChecked(s);
  };

  const filteredEmbassies = useMemo(() => {
    const q = emQuery.trim().toLowerCase();
    const sorted = [...EMBASSIES].sort((a, b) => {
      if (a.country === savedEmbassy) return -1;
      if (b.country === savedEmbassy) return 1;
      return a.country.localeCompare(b.country);
    });
    if (!q) return sorted;
    return sorted.filter((e) => e.country.toLowerCase().includes(q));
  }, [emQuery, savedEmbassy]);

  const saveMyEmbassy = (country: string) => {
    if (savedEmbassy === country) {
      localStorage.removeItem("mooj_my_embassy"); setSavedEmbassy(null);
      toast.info("Removed from favourites");
    } else {
      localStorage.setItem("mooj_my_embassy", country); setSavedEmbassy(country);
      toast.success(`${country} embassy saved as your default`);
    }
  };

  const copyNumber = async (num: string) => {
    await navigator.clipboard.writeText(num);
    toast.success(`Copied ${num}`);
  };

  return (
    <div className="container px-4 py-6">
      {/* HERO SOS */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass-strong p-6 sm:p-8 text-center relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/30 via-pink-500/20 to-purple-500/30 -z-10" />
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-destructive/30 blur-3xl -z-10 animate-pulse" />

        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldAlert className="w-6 h-6 text-destructive" />
          <h1 className="text-2xl sm:text-3xl font-bold">Tourist & Women Safety</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
          Tap the button — your live GPS is shared instantly via WhatsApp / SMS / share-sheet.
        </p>

        <div className="flex items-center justify-center">
          <button onClick={triggerSOS} disabled={sharing}
            className="relative inline-flex items-center justify-center w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-destructive to-orange-500 text-white text-3xl font-extrabold shadow-glow-pink active:scale-95 transition">
            <span className="absolute inset-0 rounded-full bg-destructive/40 animate-ping" />
            {sharing ? "Sharing…" : "SOS"}
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          {pos ? `${pos.latitude.toFixed(4)}, ${pos.longitude.toFixed(4)} · accuracy ±${Math.round(pos.accuracy)}m` : "Locating…"}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button onClick={triggerSOS} className="inline-flex items-center gap-2 text-sm glass-strong px-3 py-2 hover:bg-white/15">
            <Share2 className="w-4 h-4" /> Share location
          </button>
          <button onClick={callWhatsApp} className="inline-flex items-center gap-2 text-sm bg-[#25D366]/90 text-white px-3 py-2 rounded-xl hover:opacity-90">
            💬 WhatsApp SOS
          </button>
          <a href="tel:112" className="inline-flex items-center gap-2 text-sm bg-destructive text-white px-3 py-2 rounded-xl font-bold hover:opacity-90">
            <Phone className="w-4 h-4" /> Call 112
          </a>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* India emergency numbers */}
        <div className="glass-strong p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2"><AlertOctagon className="text-warn w-5 h-5" /> India emergency numbers</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EMERGENCY.map((e) => (
              <a key={e.num} href={`tel:${e.num}`}
                className={`bg-gradient-to-br ${e.color} rounded-xl p-3 text-white text-center hover:scale-105 active:scale-95 transition shadow-md`}>
                <div className="text-xl">{e.icon}</div>
                <div className="text-xl font-extrabold leading-none mt-1">{e.num}</div>
                <div className="text-[10px] opacity-90 mt-1">{e.name}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Safety checklist */}
        <div className="glass-strong p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><Heart className="text-primary w-5 h-5" /> Safety checklist</h3>
            <span className="text-xs text-muted-foreground">{checked.size}/{CHECKLIST.length}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-3 overflow-hidden">
            <div className="h-full bg-gradient-pink-blue transition-all" style={{ width: `${(checked.size / CHECKLIST.length) * 100}%` }} />
          </div>
          <ul className="space-y-1.5">
            {CHECKLIST.map((c, i) => (
              <li key={i}>
                <button onClick={() => toggle(i)} className="flex items-start gap-2 text-sm w-full text-left p-1.5 rounded-md hover:bg-white/5 transition">
                  {checked.has(i) ? <CheckSquare className="w-4 h-4 mt-0.5 text-safe flex-shrink-0" /> : <Square className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />}
                  <span className={checked.has(i) ? "line-through text-muted-foreground" : ""}>{c}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Embassies */}
      <div className="glass-strong p-5 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="font-bold flex items-center gap-2"><Globe className="text-secondary w-5 h-5" /> Embassy & Consulate Helplines</h3>
            <p className="text-xs text-muted-foreground">{EMBASSIES.length} countries · Save yours for 1-tap access</p>
          </div>
          <div className="glass flex items-center gap-2 px-3 py-1.5 flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={emQuery} onChange={(e) => setEmQuery(e.target.value)} placeholder="Search country…"
              className="bg-transparent outline-none text-sm flex-1" />
          </div>
        </div>

        {savedEmbassy && (
          <div className="text-xs text-primary-glow mb-2">⭐ Your embassy: <b>{savedEmbassy}</b> (pinned to top)</div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[480px] overflow-auto pr-1">
          {filteredEmbassies.map((e) => {
            const isFav = e.country === savedEmbassy;
            return (
              <div key={e.country} className={`glass p-3 ${isFav ? "ring-2 ring-primary" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{e.flag}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{e.country}</div>
                      <div className="text-[10px] text-muted-foreground">{e.city || "New Delhi"}</div>
                    </div>
                  </div>
                  <button onClick={() => saveMyEmbassy(e.country)}
                    className={`text-xs px-1.5 py-0.5 rounded ${isFav ? "bg-primary text-primary-foreground" : "glass hover:bg-white/15"}`}
                    title={isFav ? "Unpin" : "Pin as my embassy"}>
                    {isFav ? "★" : "☆"}
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <a href={`tel:${e.emergency}`} className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-pink-blue text-white text-xs font-semibold py-1.5 rounded-md hover:opacity-90">
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  <button onClick={() => copyNumber(e.emergency)} className="glass p-1.5 hover:bg-white/15" title="Copy number">
                    <Copy className="w-3 h-3" />
                  </button>
                  {e.website && (
                    <a href={e.website} target="_blank" rel="noopener noreferrer" className="glass p-1.5 hover:bg-white/15" title="Website">
                      <Globe className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 truncate">{e.emergency}</div>
              </div>
            );
          })}
          {filteredEmbassies.length === 0 && (
            <div className="text-sm text-muted-foreground col-span-full text-center py-8">No country matches "{emQuery}"</div>
          )}
        </div>
      </div>
    </div>
  );
}
