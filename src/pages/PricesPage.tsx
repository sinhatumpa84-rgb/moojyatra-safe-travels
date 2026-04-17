import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, Flag, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function PricesPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [cityId, setCityId] = useState<string | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [reportOpen, setReportOpen] = useState(false);

  const load = async () => {
    const [c, p] = await Promise.all([
      supabase.from("cities").select("*").order("name"),
      supabase.from("prices").select("*, cities(name)"),
    ]);
    setCities(c.data || []);
    setPrices(p.data || []);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => prices.filter(
    (p) => (cityId === "all" || p.city_id === cityId) && (category === "all" || p.category === category)
  ), [prices, cityId, category]);

  const categories = ["all", ...Array.from(new Set(prices.map((p) => p.category)))];

  return (
    <div className="container px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2"><IndianRupee className="text-primary" /> Price Truth Database</h1>
          <p className="text-muted-foreground mt-1">Local · Tourist · Official · scam premium %</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="glass px-3 py-2 text-sm bg-transparent">
            <option value="all" className="bg-background">All cities</option>
            {cities.map((c) => <option key={c.id} value={c.id} className="bg-background">{c.name}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="glass px-3 py-2 text-sm bg-transparent">
            {categories.map((c) => <option key={c} value={c} className="bg-background">{c === "all" ? "All categories" : c}</option>)}
          </select>
          <button onClick={() => setReportOpen(true)} className="bg-gradient-pink-blue text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-glow-pink">
            <Flag className="w-4 h-4" /> Report price
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => {
          const premium = ((p.tourist_price - p.local_price) / p.local_price) * 100;
          const high = premium > 200;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="glass-strong p-5 hover:scale-[1.02] transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase">{p.cities?.name} · {p.category}</div>
                  <h3 className="font-bold text-lg">{p.item}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-md font-bold ${high ? "bg-destructive/20 text-destructive" : "bg-warn/20 text-warn"}`}>
                  +{premium.toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center my-3">
                <div className="bg-safe/15 rounded-lg p-2"><div className="text-[10px] text-safe uppercase">Local</div><div className="font-bold">₹{p.local_price}</div></div>
                <div className="bg-destructive/15 rounded-lg p-2"><div className="text-[10px] text-destructive uppercase">Tourist</div><div className="font-bold">₹{p.tourist_price}</div></div>
                <div className="bg-secondary/15 rounded-lg p-2"><div className="text-[10px] text-secondary uppercase">Official</div><div className="font-bold">{p.official_price ? `₹${p.official_price}` : "—"}</div></div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-safe" /> Trust {p.trust_score}</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {p.report_count} reports</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {reportOpen && <ReportPriceModal cities={cities} onClose={() => setReportOpen(false)} onSaved={load} />}
    </div>
  );
}

function ReportPriceModal({ cities, onClose, onSaved }: { cities: any[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ city_id: "", item: "", reported_price: "", expected_price: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.item || !form.reported_price) { toast.error("Item and price required"); return; }
    setSaving(true);
    const { error } = await supabase.from("price_reports").insert({
      city_id: form.city_id || null,
      item: form.item.slice(0, 200),
      reported_price: parseFloat(form.reported_price),
      expected_price: form.expected_price ? parseFloat(form.expected_price) : null,
      notes: form.notes.slice(0, 500),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks! +10 points");
    onSaved(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass-strong p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Report a price</h2>
        <div className="space-y-3">
          <select value={form.city_id} onChange={(e) => setForm({ ...form, city_id: e.target.value })} className="w-full glass px-3 py-2 text-sm bg-transparent">
            <option value="" className="bg-background">Select city</option>
            {cities.map((c) => <option key={c.id} value={c.id} className="bg-background">{c.name}</option>)}
          </select>
          <input placeholder="What did you buy?" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} className="w-full glass px-3 py-2 text-sm bg-transparent" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Price you paid" value={form.reported_price} onChange={(e) => setForm({ ...form, reported_price: e.target.value })} className="glass px-3 py-2 text-sm bg-transparent" />
            <input type="number" placeholder="Expected price" value={form.expected_price} onChange={(e) => setForm({ ...form, expected_price: e.target.value })} className="glass px-3 py-2 text-sm bg-transparent" />
          </div>
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full glass px-3 py-2 text-sm bg-transparent min-h-20" />
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm">Cancel</button>
            <button onClick={submit} disabled={saving} className="bg-gradient-pink-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">
              {saving ? "Saving…" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
