import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, MapPin, Loader2, CheckCircle2, Receipt, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Badge = { id: string; code: string; name: string; description: string | null; icon: string | null; points: number | null };

// Maps a place name (lowercased, partial match) to an India badge code.
const PLACE_BADGE_RULES: { match: RegExp; code: string }[] = [
  { match: /taj\s*mahal/i, code: "taj_mahal" },
  { match: /golden\s*temple|harmandir/i, code: "golden_temple" },
  { match: /gateway\s*of\s*india/i, code: "gateway_india" },
  { match: /hampi/i, code: "hampi" },
  { match: /varanasi|kashi|ganga\s*aarti/i, code: "varanasi_ghats" },
  { match: /mysore\s*palace/i, code: "mysore_palace" },
  { match: /hawa\s*mahal/i, code: "hawa_mahal" },
  { match: /konark/i, code: "konark" },
  { match: /meenakshi/i, code: "meenakshi" },
  { match: /khajuraho/i, code: "khajuraho" },
  { match: /ajanta/i, code: "ajanta" },
  { match: /lotus\s*temple/i, code: "lotus_temple" },
  { match: /qutub\s*minar/i, code: "qutub_minar" },
  { match: /charminar/i, code: "charminar" },
  { match: /victoria\s*memorial/i, code: "victoria_memorial" },
  { match: /sanchi/i, code: "sanchi" },
  { match: /rann|kutch/i, code: "rann_kutch" },
];

function detectBadge(name: string): string | null {
  const r = PLACE_BADGE_RULES.find((r) => r.match.test(name));
  return r?.code ?? null;
}

export default function VisitPage() {
  const [place, setPlace] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [bill, setBill] = useState<File | null>(null);
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ points: number; badge?: string } | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [myCount, setMyCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.from("badges").select("*").then(({ data }) => setAllBadges((data as Badge[]) || []));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setPos([p.coords.latitude, p.coords.longitude]),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("visited_places").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setMyCount(count || 0));
  }, [user, done]);

  async function signInQuick() {
    const email = prompt("Enter your email to sign in (a magic link will be sent):");
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) toast.error(error.message);
    else toast.success("Magic link sent — check your email.");
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("scam-evidence").upload(path, file, { upsert: false });
    if (error) throw error;
    return supabase.storage.from("scam-evidence").getPublicUrl(path).data.publicUrl;
  }

  async function submit() {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!place.trim()) { toast.error("Place name required"); return; }
    if (!photo) { toast.error("Photo of the place required"); return; }
    setLoading(true);
    try {
      const photo_url = await uploadFile(photo, "visits");
      const bill_url = bill ? await uploadFile(bill, "bills") : null;
      const badgeCode = detectBadge(place);
      const points = badgeCode ? (allBadges.find((b) => b.code === badgeCode)?.points || 50) : 50;

      const { error: insErr } = await supabase.from("visited_places").insert({
        user_id: user.id,
        place_name: place.trim(),
        place_lat: pos?.[0] ?? null,
        place_lng: pos?.[1] ?? null,
        photo_url,
        bill_url,
        notes: notes.trim() || null,
        points_awarded: points,
        badge_code: badgeCode,
      });
      if (insErr) throw insErr;

      // bump profile points
      const { data: prof } = await supabase.from("profiles").select("points").eq("user_id", user.id).maybeSingle();
      const newPts = (prof?.points ?? 0) + points;
      await supabase.from("profiles").update({ points: newPts }).eq("user_id", user.id);

      // award badge
      if (badgeCode) {
        const { data: badge } = await supabase.from("badges").select("id").eq("code", badgeCode).maybeSingle();
        if (badge?.id) {
          await supabase.from("user_badges").insert({ user_id: user.id, badge_id: badge.id });
        }
      }

      // mega badge: visited 10+ places
      if (myCount + 1 >= 10) {
        const { data: mega } = await supabase.from("badges").select("id").eq("code", "bharat_yatri").maybeSingle();
        if (mega?.id) await supabase.from("user_badges").insert({ user_id: user.id, badge_id: mega.id });
      }

      setDone({ points, badge: badgeCode || undefined });
      setPlace(""); setNotes(""); setPhoto(null); setBill(null);
    } catch (e: any) {
      toast.error(e.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container px-4 py-6 max-w-2xl">
      <h1 className="text-4xl font-bold flex items-center gap-2 mb-1"><Camera className="text-pink-400" /> Submit your visit</h1>
      <p className="text-muted-foreground mb-6">Visited a famous place in India? Upload a photo + bill (optional) and earn points & badges.</p>

      {!user && (
        <div className="glass-strong p-5 mb-5 flex items-center justify-between">
          <p className="text-sm">Sign in to submit visits and earn points.</p>
          <button onClick={signInQuick} className="bg-gradient-pink-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">Sign in</button>
        </div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-strong p-5 mb-5 border border-safe/40">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-safe" />
            <div>
              <div className="font-bold">+{done.points} points awarded!</div>
              {done.badge && <div className="text-sm text-primary-glow flex items-center gap-1"><Trophy className="w-4 h-4" /> Badge unlocked: {allBadges.find((b) => b.code === done.badge)?.name}</div>}
            </div>
          </div>
        </motion.div>
      )}

      <div className="glass-strong p-5 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Place name *</label>
          <input value={place} onChange={(e) => setPlace(e.target.value)}
            placeholder="e.g. Taj Mahal, Golden Temple, Hampi…"
            className="w-full mt-1 glass px-4 py-3 text-sm bg-transparent" />
          {place && detectBadge(place) && (
            <p className="text-xs text-primary-glow mt-1">🏆 This will unlock: {allBadges.find((b) => b.code === detectBadge(place))?.name}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Photo of the place *</label>
          <label className="mt-1 flex items-center gap-2 glass px-4 py-3 text-sm cursor-pointer hover:bg-white/15">
            <Upload className="w-4 h-4" />
            <span>{photo ? photo.name : "Upload selfie or place photo"}</span>
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Bill / receipt (optional — restaurant, hotel, ticket)</label>
          <label className="mt-1 flex items-center gap-2 glass px-4 py-3 text-sm cursor-pointer hover:bg-white/15">
            <Receipt className="w-4 h-4" />
            <span>{bill ? bill.name : "Upload bill — helps fight overcharging"}</span>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => setBill(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder="Tips for other travellers — fair price, scams to avoid, best time…"
            className="w-full mt-1 glass px-4 py-3 text-sm bg-transparent resize-none" />
        </div>

        {pos && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Location: {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
          </div>
        )}

        <button onClick={submit} disabled={loading || !user}
          className="w-full bg-gradient-pink-blue text-white font-semibold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
          {loading ? "Uploading…" : "Submit & earn points"}
        </button>
      </div>

      <div className="mt-6 glass-strong p-5">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-warn" /> India badges to collect</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {allBadges.filter((b) => b.code !== "bharat_yatri").map((b) => (
            <div key={b.id} className="glass p-2 text-center" title={b.description || ""}>
              <div className="text-2xl">{b.icon || "🏅"}</div>
              <div className="text-[10px] line-clamp-2 mt-1">{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
