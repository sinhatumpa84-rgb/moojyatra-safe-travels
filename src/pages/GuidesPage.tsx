import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Star, MapPin, Languages, BadgeCheck, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

export default function GuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    supabase.from("guides").select("*, cities(name)").order("rating", { ascending: false })
      .then(({ data }) => setGuides(data || []));
  }, []);

  return (
    <div className="container px-4 py-6">
      <h1 className="text-4xl font-bold mb-2">Verified guides</h1>
      <p className="text-muted-foreground mb-6">Govt-licensed, multilingual, rated by travelers.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {guides.map((g, i) => (
          <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass-strong p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-sunset grid place-items-center text-2xl font-bold text-white">
                {g.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight flex items-center gap-1">{g.name}{g.verified && <BadgeCheck className="w-4 h-4 text-secondary" />}</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {g.cities?.name}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{g.bio}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {g.languages?.map((l: string) => <span key={l} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/20 text-secondary">{l}</span>)}
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1 text-sm font-semibold text-warn"><Star className="w-4 h-4 fill-warn" /> {g.rating}</span>
              <span className="text-sm font-bold gradient-text">₹{g.hourly_rate}/hr</span>
            </div>
            <button onClick={() => setSelected(g)} className="w-full bg-gradient-pink-blue text-white py-2 rounded-lg text-sm font-semibold">
              Book now
            </button>
          </motion.div>
        ))}
      </div>

      {selected && <BookingModal guide={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function BookingModal({ guide, onClose }: { guide: any; onClose: () => void }) {
  const [form, setForm] = useState({ date: "", duration_hours: 2, language: guide.languages?.[0] || "English", notes: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.date) { toast.error("Pick a date"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Anonymous booking — sign in anonymously is disabled by default; surface a tip
      toast.info("Sign in to confirm booking. Demo: details captured locally.");
      setSaving(false); onClose(); return;
    }
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id, guide_id: guide.id, date: form.date,
      duration_hours: form.duration_hours, language: form.language, notes: form.notes,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Booked ${guide.name}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass-strong p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-1">Book {guide.name}</h2>
        <p className="text-xs text-muted-foreground mb-4">₹{guide.hourly_rate}/hr · {guide.cities?.name}</p>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Date</span>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full glass px-3 py-2 text-sm bg-transparent" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> Duration (hours)</span>
            <input type="number" min={1} max={12} value={form.duration_hours} onChange={(e) => setForm({ ...form, duration_hours: parseInt(e.target.value) })} className="w-full glass px-3 py-2 text-sm bg-transparent" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Languages className="w-3 h-3" /> Language</span>
            <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full glass px-3 py-2 text-sm bg-transparent">
              {guide.languages?.map((l: string) => <option key={l} value={l} className="bg-background">{l}</option>)}
            </select>
          </label>
          <textarea placeholder="Special requests" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full glass px-3 py-2 text-sm bg-transparent min-h-20" />
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-muted-foreground">Total ≈</span>
            <span className="text-xl font-bold gradient-text">₹{guide.hourly_rate * form.duration_hours}</span>
          </div>
          <button onClick={submit} disabled={saving} className="w-full bg-gradient-pink-blue text-white py-2.5 rounded-lg font-semibold">
            {saving ? "Booking…" : "Confirm booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
