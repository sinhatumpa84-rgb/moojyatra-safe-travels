import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, MapPin, Award, LogOut, Pencil, Trash2, Save, X, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState("");
  const [editingVisit, setEditingVisit] = useState<string | null>(null);
  const [visitNotes, setVisitNotes] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { setAuthOpen(true); return; }
    setAuthOpen(false);
    void loadAll();
  }, [user, loading]);

  const loadAll = async () => {
    if (!user) return;
    const [{ data: p }, { data: ub }, { data: ab }, { data: v }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_badges").select("*, badges(*)").eq("user_id", user.id),
      supabase.from("badges").select("*"),
      supabase.from("visited_places").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProfile(p); setName(p?.display_name ?? "");
    setBadges(ub || []); setAllBadges(ab || []); setVisits(v || []);
  };

  const saveName = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Name updated"); setEditName(false); loadAll();
  };

  const deleteVisit = async (id: string, points: number) => {
    if (!confirm("Delete this visit? You'll lose the points.")) return;
    const { error } = await supabase.from("visited_places").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (profile) await supabase.from("profiles").update({ points: Math.max(0, (profile.points || 0) - points) }).eq("user_id", user!.id);
    toast.success("Deleted"); loadAll();
  };

  const saveVisitNotes = async (id: string) => {
    const { error } = await supabase.from("visited_places").update({ notes: visitNotes }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); setEditingVisit(null); loadAll();
  };

  if (loading) return <div className="container py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  if (!user) return (
    <div className="container py-20 text-center">
      <h1 className="text-3xl font-bold gradient-text mb-3">Sign in to view your profile</h1>
      <p className="text-muted-foreground mb-6">Track points, badges, and your travel journey across India.</p>
      <Button onClick={() => setAuthOpen(true)} className="bg-gradient-pink-blue text-white">Sign in / Sign up</Button>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );

  const earnedCodes = new Set(badges.map((b) => b.badges?.code));

  return (
    <div className="container px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-sunset grid place-items-center text-3xl font-black text-white shadow-glow-pink">
          {(profile?.display_name || user.email || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {editName ? (
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
              <Button size="icon" onClick={saveName}><Save className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => { setEditName(false); setName(profile?.display_name ?? ""); }}><X className="w-4 h-4" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold">{profile?.display_name ?? "Traveler"}</h1>
              <button onClick={() => setEditName(true)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex gap-4 mt-3 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 glass px-3 py-1 rounded-full"><Trophy className="w-4 h-4 text-warn" /><b>{profile?.points ?? 0}</b> pts</div>
            <div className="flex items-center gap-1.5 glass px-3 py-1 rounded-full"><Award className="w-4 h-4 text-secondary" /><b>{badges.length}</b> badges</div>
            <div className="flex items-center gap-1.5 glass px-3 py-1 rounded-full"><MapPin className="w-4 h-4 text-primary" /><b>{visits.length}</b> visits</div>
          </div>
        </div>
        <Button variant="outline" onClick={() => signOut()} className="gap-2"><LogOut className="w-4 h-4" /> Sign out</Button>
      </motion.div>

      <section className="glass-strong p-5">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-secondary" /> Badges Earned</h2>
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground">No badges yet. Visit famous places in India to earn your first one!</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {badges.map((b) => (
              <div key={b.id} className="glass p-3 text-center rounded-xl">
                <div className="text-3xl mb-1">{b.badges?.icon ?? "🏅"}</div>
                <div className="text-xs font-semibold truncate">{b.badges?.name}</div>
                <div className="text-[10px] text-warn">+{b.badges?.points} pts</div>
              </div>
            ))}
          </div>
        )}
        <h3 className="text-sm font-semibold text-muted-foreground mt-5 mb-2">Locked badges</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
          {allBadges.filter((b) => !earnedCodes.has(b.code)).map((b) => (
            <div key={b.id} className="glass p-2 text-center rounded-lg opacity-40" title={b.description}>
              <div className="text-2xl grayscale">{b.icon ?? "🔒"}</div>
              <div className="text-[10px] truncate">{b.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-strong p-5">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> My Visits</h2>
        {visits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No visits yet. <a href="/visit" className="text-primary underline">Submit your first place</a> to earn points.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visits.map((v) => (
              <div key={v.id} className="glass rounded-xl overflow-hidden">
                <img src={v.photo_url} alt={v.place_name} className="w-full h-40 object-cover" loading="lazy" />
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold">{v.place_name}</div>
                      <div className="text-xs text-warn">+{v.points_awarded} pts {v.badge_code && "· 🏅"}</div>
                    </div>
                    <button onClick={() => deleteVisit(v.id, v.points_awarded)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {editingVisit === v.id ? (
                    <div className="space-y-2">
                      <Input value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} placeholder="Notes" />
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => saveVisitNotes(v.id)} className="flex-1">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingVisit(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-xs text-muted-foreground flex-1 line-clamp-2">{v.notes || "No notes"}</p>
                      <button onClick={() => { setEditingVisit(v.id); setVisitNotes(v.notes || ""); }} className="text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
                    </div>
                  )}
                  {v.bill_url && <a href={v.bill_url} target="_blank" rel="noreferrer" className="text-[10px] text-secondary underline flex items-center gap-1"><Camera className="w-3 h-3" /> View bill</a>}
                  <div className="text-[10px] text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
