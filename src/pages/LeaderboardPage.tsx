import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trophy, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("*").order("points", { ascending: false }).limit(20)
      .then(({ data }) => setProfiles(data || []));
    supabase.from("badges").select("*").then(({ data }) => setBadges(data || []));
  }, []);

  return (
    <div className="container px-4 py-6">
      <h1 className="text-4xl font-bold flex items-center gap-2 mb-6"><Trophy className="text-warn" /> Leaderboard & Badges</h1>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <div className="glass-strong p-5">
          <h2 className="font-bold mb-4">Top travelers</h2>
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No travelers yet — be the first to earn points by reporting prices and scams!</p>
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
          <h2 className="font-bold mb-4">Badges to earn</h2>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                className="glass p-4 text-center hover:bg-white/15 transition">
                <Award className="w-8 h-8 text-purple mx-auto mb-2" />
                <div className="font-bold text-sm">{b.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{b.description}</div>
                <div className="text-xs mt-2 gradient-text font-bold">+{b.points} pts</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
