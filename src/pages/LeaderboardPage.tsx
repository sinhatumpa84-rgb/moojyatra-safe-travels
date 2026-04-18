import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Camera, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("*").order("points", { ascending: false }).limit(20)
      .then(({ data }) => setProfiles(data || []));
    supabase.from("badges").select("*").order("points", { ascending: false })
      .then(({ data }) => setBadges(data || []));
    supabase.from("visited_places").select("*").order("created_at", { ascending: false }).limit(12)
      .then(({ data }) => setVisits(data || []));
  }, []);

  return (
    <div className="container px-4 py-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-4xl font-bold flex items-center gap-2"><Trophy className="text-warn" /> Leaderboard & Badges</h1>
        <Link to="/visit" className="bg-gradient-pink-blue text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-glow-pink">
          <Camera className="w-4 h-4" /> Submit a visit
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <div className="glass-strong p-5">
          <h2 className="font-bold mb-4">Top travelers</h2>
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No travelers yet — be the first to earn points by reporting prices, scams, or submitting visits!</p>
          ) : (
            <ol className="space-y-2">
              {profiles.map((p, i) => (
                <li key={p.id} className="glass p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg grid place-items-center font-bold text-sm ${i < 3 ? "bg-gradient-sunset text-white" : "bg-white/10"}`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-medium">{p.display_name || "Anonymous traveler"}</div>
                    <div className="text-xs text-muted-foreground">{p.points} points</div>
                  </div>
                  {i === 0 && <Trophy className="w-5 h-5 text-warn" />}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="glass-strong p-5">
          <h2 className="font-bold mb-4">India badges to earn ({badges.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-auto pr-1">
            {badges.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                className="glass p-3 text-center hover:bg-white/15 transition">
                <div className="text-3xl mb-1">{b.icon || "🏅"}</div>
                <div className="font-bold text-xs">{b.name}</div>
                <div className="text-[10px] text-muted-foreground line-clamp-2">{b.description}</div>
                <div className="text-xs mt-1 gradient-text font-bold">+{b.points} pts</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 glass-strong p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Camera className="w-5 h-5 text-pink-400" /> Recent visits</h2>
        {visits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No visits submitted yet. <Link to="/visit" className="text-primary-glow underline">Be the first →</Link></p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {visits.map((v) => (
              <div key={v.id} className="glass overflow-hidden">
                <div className="aspect-square bg-white/5 overflow-hidden">
                  <img src={v.photo_url} alt={v.place_name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-2">
                  <div className="text-xs font-bold line-clamp-1">{v.place_name}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> +{v.points_awarded} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
