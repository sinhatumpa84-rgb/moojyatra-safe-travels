import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PresenceRow = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  lat: number;
  lng: number;
  city: string | null;
  updated_at: string;
};

// Broadcast my location + subscribe to others
export function usePresence(pos: [number, number] | null, city: string | null, enabled: boolean) {
  const [others, setOthers] = useState<PresenceRow[]>([]);

  // Push my position
  useEffect(() => {
    if (!enabled || !pos) return;
    let cancelled = false;
    const push = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data: profile } = await supabase
        .from("profiles").select("display_name, avatar_url").eq("user_id", user.id).maybeSingle();
      await supabase.from("user_presence").upsert({
        user_id: user.id,
        display_name: profile?.display_name ?? user.email?.split("@")[0] ?? "Traveler",
        avatar_url: profile?.avatar_url ?? null,
        lat: pos[0], lng: pos[1], city,
        updated_at: new Date().toISOString(),
      });
    };
    push();
    const id = setInterval(push, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [enabled, pos?.[0], pos?.[1], city]);

  // Fetch + realtime
  useEffect(() => {
    const fresh = new Date(Date.now() - 10 * 60_000).toISOString();
    supabase.from("user_presence").select("*").gte("updated_at", fresh)
      .then(({ data }) => setOthers((data as PresenceRow[]) || []));

    const ch = supabase.channel("presence-room")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_presence" }, (payload) => {
        setOthers((prev) => {
          const row = (payload.new || payload.old) as PresenceRow;
          if (payload.eventType === "DELETE") return prev.filter((p) => p.user_id !== row.user_id);
          const without = prev.filter((p) => p.user_id !== row.user_id);
          return [...without, payload.new as PresenceRow];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return others;
}
