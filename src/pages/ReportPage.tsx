import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Upload, Scale, Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ReportPage() {
  const [form, setForm] = useState({ title: "", description: "", city: "" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    if (form.description.length < 10) { toast.error("Describe what happened (min 10 chars)"); return; }
    setLoading(true); setResult(null);

    let mediaUrl: string | null = null;
    if (file) {
      const path = `public/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("scam-evidence").upload(path, file);
      if (upErr) { toast.error("Upload failed: " + upErr.message); }
      else {
        const { data } = supabase.storage.from("scam-evidence").getPublicUrl(path);
        mediaUrl = data.publicUrl;
      }
    }

    const { data, error } = await supabase.functions.invoke("analyze-scam", {
      body: { title: form.title, description: form.description, city: form.city, mediaUrl },
    });

    if (error) {
      toast.error(error.message || "Analysis failed");
      setLoading(false); return;
    }
    setResult(data);

    // Save report
    await supabase.from("scam_reports").insert({
      title: form.title.slice(0, 200),
      description: form.description.slice(0, 5000),
      media_url: mediaUrl,
      scam_score: data.scam_score,
      ai_summary: data.summary,
      legal_sections: data.legal_sections,
      recommended_actions: data.recommended_actions,
      status: "analyzed",
    });

    setLoading(false);
    toast.success(`Analysis complete · scam score ${data.scam_score}/100`);
  };

  const emailPolice = () => {
    if (!result) return;
    const body = encodeURIComponent(result.police_email_body);
    const subject = encodeURIComponent(result.police_email_subject);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container px-4 py-6 max-w-4xl">
      <h1 className="text-4xl font-bold flex items-center gap-2"><AlertTriangle className="text-destructive" /> Report a Scam</h1>
      <p className="text-muted-foreground mt-1 mb-6">AI analyzes your report → maps to Indian laws → drafts a complaint email.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-strong p-5 space-y-3">
          <input placeholder="Short title (e.g. Auto driver overcharged)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full glass px-3 py-2 text-sm bg-transparent" />
          <input placeholder="City (Delhi, Agra…)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full glass px-3 py-2 text-sm bg-transparent" />
          <textarea placeholder="What happened? Be specific — location, amounts, names." value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full glass px-3 py-2 text-sm bg-transparent min-h-40" />
          <label className="block">
            <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Upload className="w-3 h-3" /> Evidence (image/video)</span>
            <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary-glow file:px-3 file:py-1.5" />
          </label>
          <button onClick={submit} disabled={loading || !form.title || !form.description}
            className="w-full bg-gradient-pink-blue text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-glow-pink disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <>Analyze with AI <Scale className="w-4 h-4" /></>}
          </button>
        </div>

        <div className="glass-strong p-5 min-h-[360px]">
          {!result && !loading && <div className="text-sm text-muted-foreground text-center py-12">AI analysis appears here.</div>}
          {loading && <div className="text-center py-12 text-muted-foreground">AI is reviewing & matching laws…</div>}
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="text-center">
                <div className="text-xs uppercase text-muted-foreground">Scam probability</div>
                <div className={`text-5xl font-extrabold ${result.scam_score > 70 ? "text-destructive" : result.scam_score > 40 ? "text-warn" : "text-safe"}`}>
                  {result.scam_score}/100
                </div>
              </div>
              <p className="text-sm">{result.summary}</p>

              <div>
                <h4 className="font-bold text-sm mb-2 flex items-center gap-1"><Scale className="w-4 h-4 text-purple" /> Possible legal violations</h4>
                <ul className="space-y-2">
                  {result.legal_sections?.map((l: any, i: number) => (
                    <li key={i} className="glass p-2 text-xs">
                      <div className="font-semibold text-purple">{l.act} · {l.section}</div>
                      <div className="text-muted-foreground">{l.description}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-2">Recommended actions</h4>
                <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                  {result.recommended_actions?.map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>
              </div>

              <button onClick={emailPolice} className="w-full bg-gradient-sunset text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Email draft to police
              </button>
              <p className="text-[10px] text-muted-foreground italic">Informational only. Not legal advice.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
