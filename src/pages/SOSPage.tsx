import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Phone, MapPin, Share2, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";

const EMERGENCY = [
  { name: "Universal Emergency", num: "112", color: "from-red-500 to-orange-500" },
  { name: "Women Helpline", num: "1091", color: "from-pink-500 to-purple-500" },
  { name: "Police", num: "100", color: "from-blue-500 to-cyan-500" },
  { name: "Tourist Helpline", num: "1363", color: "from-emerald-500 to-teal-500" },
  { name: "Ambulance", num: "102", color: "from-rose-500 to-red-500" },
  { name: "Child Helpline", num: "1098", color: "from-yellow-500 to-orange-500" },
];

const CHECKLIST = [
  "Share live location with a trusted contact",
  "Note your hotel address & nearest landmark",
  "Keep copy of passport & visa in cloud",
  "Save embassy contact number",
  "Avoid solo travel in scam-zone areas after dark",
  "Use only prepaid taxi or app-based rides",
  "Carry small change to avoid 'no change' scam",
  "Keep emergency money in two separate places",
];

export default function SOSPage() {
  const [pos, setPos] = useState<GeolocationCoordinates | null>(null);
  const [sharing, setSharing] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => setPos(p.coords), () => {});
  }, []);

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

  const toggle = (i: number) => {
    const s = new Set(checked); s.has(i) ? s.delete(i) : s.add(i); setChecked(s);
  };

  return (
    <div className="container px-4 py-6">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="glass-strong p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 via-pink-500/10 to-purple-500/20 -z-10" />
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-2">Women & Tourist Safety</h1>
          <p className="text-muted-foreground mb-6">One tap shares your live GPS to your trusted contact + emergency numbers.</p>

          <button onClick={triggerSOS} disabled={sharing}
            className="relative inline-flex items-center justify-center w-44 h-44 rounded-full bg-gradient-to-br from-destructive to-orange-500 text-white text-3xl font-extrabold shadow-glow-pink animate-pulse-glow active:scale-95 transition">
            {sharing ? "Sharing…" : "SOS"}
          </button>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {pos ? `${pos.latitude.toFixed(4)}, ${pos.longitude.toFixed(4)}` : "Locating…"}
          </div>

          <button onClick={triggerSOS} className="mt-4 inline-flex items-center gap-2 text-sm glass px-3 py-2">
            <Share2 className="w-4 h-4" /> Share live location
          </button>
        </motion.div>

        <div className="space-y-4">
          <div className="glass-strong p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Phone className="text-secondary w-4 h-4" /> Emergency numbers</h3>
            <div className="grid grid-cols-2 gap-2">
              {EMERGENCY.map((e) => (
                <a key={e.num} href={`tel:${e.num}`} className={`bg-gradient-to-br ${e.color} rounded-xl p-3 text-white text-center hover:scale-105 transition`}>
                  <div className="text-2xl font-extrabold">{e.num}</div>
                  <div className="text-xs opacity-90">{e.name}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="glass-strong p-5">
            <h3 className="font-bold mb-3">Safety checklist</h3>
            <ul className="space-y-2">
              {CHECKLIST.map((c, i) => (
                <li key={i}>
                  <button onClick={() => toggle(i)} className="flex items-start gap-2 text-sm w-full text-left hover:text-primary-glow transition">
                    {checked.has(i) ? <CheckSquare className="w-4 h-4 mt-0.5 text-safe" /> : <Square className="w-4 h-4 mt-0.5 text-muted-foreground" />}
                    <span className={checked.has(i) ? "line-through text-muted-foreground" : ""}>{c}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-xs text-muted-foreground">{checked.size}/{CHECKLIST.length} done</div>
          </div>
        </div>
      </div>
    </div>
  );
}
