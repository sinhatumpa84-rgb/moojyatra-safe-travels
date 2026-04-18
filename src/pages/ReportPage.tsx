import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Upload, Scale, Mail, Loader2, Mic, MicOff, Send, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useVoiceInput } from "@/hooks/useVoiceInput";

type Step = "input" | "analyzing" | "review" | "submitted";

export default function ReportPage() {
  const [form, setForm] = useState({ title: "", description: "", city: "" });
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState<Step>("input");
  const [voiceLang, setVoiceLang] = useState("en-IN");
  const [submitting, setSubmitting] = useState(false);
  const [policeEmail, setPoliceEmail] = useState("");

  const voice = useVoiceInput(voiceLang);

  // Use voice transcript directly into description
  const useTranscript = () => {
    if (!voice.transcript.trim()) { toast.error("Nothing recorded yet"); return; }
    setForm((f) => ({ ...f, description: (f.description + " " + voice.transcript).trim() }));
    voice.reset();
    toast.success("Voice added to description");
  };

  // STEP 1 → STEP 2: AI analyzes BEFORE saving
  const analyze = async () => {
    if (form.description.length < 10) { toast.error("Describe what happened (min 10 chars)"); return; }
    setStep("analyzing"); setResult(null);

    let mediaUrl: string | null = null;
    if (file) {
      if (file.size > 25 * 1024 * 1024) { toast.error("File too large (max 25MB)"); setStep("input"); return; }
      const path = `public/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
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

    if (error || !data) {
      toast.error(error?.message || "AI analysis failed. Try again.");
      setStep("input"); return;
    }
    setResult({ ...data, mediaUrl });
    setStep("review");
    toast.success(`AI analysis complete · score ${data.scam_score}/100`);
  };

  // STEP 3: User confirms → save to DB + open email
  const confirmSubmit = async () => {
    if (!result) return;
    setSubmitting(true);
    const { error } = await supabase.from("scam_reports").insert({
      title: form.title.slice(0, 200),
      description: form.description.slice(0, 5000),
      media_url: result.mediaUrl,
      scam_score: result.scam_score,
      ai_summary: result.summary,
      legal_sections: result.legal_sections,
      recommended_actions: result.recommended_actions,
      status: "submitted",
    });
    setSubmitting(false);
    if (error) { toast.error("Failed to save: " + error.message); return; }
    toast.success("Report saved ✓");
    setStep("submitted");
  };

  const emailPolice = () => {
    if (!result) return;
    const body = encodeURIComponent(result.police_email_body || "");
    const subject = encodeURIComponent(result.police_email_subject || "Tourist scam complaint");
    const to = encodeURIComponent(policeEmail || "");
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const restart = () => {
    setForm({ title: "", description: "", city: "" });
    setFile(null); setResult(null); setStep("input"); voice.reset(); setPoliceEmail("");
  };

  return (
    <div className="container px-4 py-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
          <AlertTriangle className="text-destructive" /> Report a Scam
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`px-2 py-1 rounded ${step === "input" ? "bg-primary/20 text-primary-glow" : "glass"}`}>1. Describe</span>
          →
          <span className={`px-2 py-1 rounded ${step === "analyzing" || step === "review" ? "bg-primary/20 text-primary-glow" : "glass"}`}>2. AI analysis</span>
          →
          <span className={`px-2 py-1 rounded ${step === "submitted" ? "bg-safe/20 text-safe" : "glass"}`}>3. Submit</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Voice or text → AI checks first → you review → then we save & draft a police email.</p>

      {step === "input" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* FORM */}
          <div className="glass-strong p-5 space-y-3">
            <input placeholder="Short title (e.g. Auto driver overcharged ₹500)"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200} className="w-full glass px-3 py-2 text-sm bg-transparent" />
            <input placeholder="City (Delhi, Agra, Jaipur…)"
              value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              maxLength={80} className="w-full glass px-3 py-2 text-sm bg-transparent" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Voice input language:</span>
              <select value={voiceLang} onChange={(e) => setVoiceLang(e.target.value)}
                className="bg-white/10 text-foreground text-xs rounded-md px-2 py-1 border border-white/10 outline-none">
                <option value="en-IN">English (IN)</option>
                <option value="hi-IN">हिन्दी</option>
                <option value="bn-IN">বাংলা</option>
                <option value="ta-IN">தமிழ்</option>
                <option value="te-IN">తెలుగు</option>
                <option value="mr-IN">मराठी</option>
                <option value="gu-IN">ગુજરાતી</option>
                <option value="kn-IN">ಕನ್ನಡ</option>
                <option value="ml-IN">മലയാളം</option>
                <option value="pa-IN">ਪੰਜਾਬੀ</option>
              </select>
            </div>

            {voice.supported ? (
              <div className="glass p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1">
                    <Mic className={`w-3.5 h-3.5 ${voice.listening ? "text-destructive animate-pulse" : "text-secondary"}`} />
                    {voice.listening ? "Listening… speak now" : "Voice input"}
                  </span>
                  <div className="flex gap-1">
                    {!voice.listening ? (
                      <button onClick={voice.start} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-semibold">
                        Start
                      </button>
                    ) : (
                      <button onClick={voice.stop} className="text-xs bg-destructive text-white px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                        <MicOff className="w-3 h-3" /> Stop
                      </button>
                    )}
                    <button onClick={voice.reset} className="text-xs glass px-2 py-1 rounded-md" title="Clear">
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-xs min-h-[40px] text-muted-foreground">
                  {voice.transcript || voice.interim || "Tap Start, describe what happened in your language."}
                  {voice.interim && <span className="opacity-60 italic"> {voice.interim}</span>}
                </div>
                {voice.transcript && (
                  <button onClick={useTranscript} className="mt-2 text-xs bg-gradient-pink-blue text-white px-2.5 py-1 rounded-md font-semibold">
                    ↓ Add to description
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-warn glass p-2">⚠ Voice input not supported on this browser. Use Chrome/Edge.</div>
            )}

            <textarea placeholder="What happened? Be specific — location, amounts, names. Or use voice ↑"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={5000}
              className="w-full glass px-3 py-2 text-sm bg-transparent min-h-32" />

            <label className="block">
              <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Upload className="w-3 h-3" /> Evidence (image / video, max 25MB)
              </span>
              <input type="file" accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary-glow file:px-3 file:py-1.5" />
              {file && <div className="text-[10px] text-muted-foreground mt-1">📎 {file.name} · {(file.size / 1024 / 1024).toFixed(1)}MB</div>}
            </label>

            <button onClick={analyze} disabled={!form.title || form.description.length < 10}
              className="w-full bg-gradient-pink-blue text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-glow-pink disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> Analyze with AI first
            </button>
          </div>

          {/* INFO PANEL */}
          <div className="glass-strong p-5 text-sm space-y-3">
            <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-safe" /> How it works</h3>
            <ol className="space-y-2 text-xs text-muted-foreground list-decimal pl-4">
              <li><b className="text-foreground">Describe</b> via voice (10 Indian languages) or typing.</li>
              <li><b className="text-foreground">AI analyzes</b> the incident — checks if it matches known scam patterns and Indian laws (IPC, Consumer Protection, Cyber).</li>
              <li><b className="text-foreground">You review</b> the AI verdict, scam score, legal sections.</li>
              <li><b className="text-foreground">You confirm</b> → report saved, complaint email auto-drafted to nearest police email.</li>
            </ol>
            <div className="glass p-3 text-xs">
              <b>Tips for a strong report:</b>
              <ul className="list-disc pl-4 mt-1 text-muted-foreground space-y-1">
                <li>Mention the exact location (street, monument)</li>
                <li>Include amounts, dates, vehicle/shop names</li>
                <li>Attach photo of bill/receipt if possible</li>
              </ul>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Informational only. Not legal advice.</p>
          </div>
        </div>
      )}

      {step === "analyzing" && (
        <div className="glass-strong p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="font-bold text-lg">AI is reviewing your report…</h3>
          <p className="text-sm text-muted-foreground mt-1">Matching against Indian scam patterns + IPC sections.</p>
        </div>
      )}

      {step === "review" && result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
          <div className="glass-strong p-5 space-y-4">
            <div className="text-center">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">AI Scam probability</div>
              <div className={`text-6xl font-extrabold ${result.scam_score > 70 ? "text-destructive" : result.scam_score > 40 ? "text-warn" : "text-safe"}`}>
                {result.scam_score}<span className="text-xl text-muted-foreground">/100</span>
              </div>
              <div className="text-sm font-semibold mt-1">
                {result.scam_score > 70 ? "🚨 Very likely a scam" : result.scam_score > 40 ? "⚠ Possible scam" : "✓ Probably not a scam"}
              </div>
            </div>
            <p className="text-sm">{result.summary}</p>
            <div>
              <h4 className="font-bold text-sm mb-2 flex items-center gap-1"><Scale className="w-4 h-4 text-primary" /> Possible legal violations</h4>
              <ul className="space-y-2">
                {result.legal_sections?.map((l: any, i: number) => (
                  <li key={i} className="glass p-2.5 text-xs">
                    <div className="font-semibold text-primary-glow">{l.act} · {l.section}</div>
                    <div className="text-muted-foreground mt-0.5">{l.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass-strong p-5 space-y-4">
            <div>
              <h4 className="font-bold text-sm mb-2">Recommended actions</h4>
              <ul className="text-xs space-y-1.5 list-disc pl-4 text-muted-foreground">
                {result.recommended_actions?.map((a: string, i: number) => <li key={i}>{a}</li>)}
              </ul>
            </div>

            <div className="glass p-3">
              <label className="text-xs font-semibold flex items-center gap-1 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-secondary" /> Police email (optional)
              </label>
              <input type="email" placeholder="local police station email"
                value={policeEmail} onChange={(e) => setPoliceEmail(e.target.value)}
                className="w-full glass px-2 py-1.5 text-xs bg-transparent" />
              <p className="text-[10px] text-muted-foreground mt-1">Leave blank to compose without recipient.</p>
            </div>

            <div className="space-y-2">
              <button onClick={confirmSubmit} disabled={submitting}
                className="w-full bg-gradient-sunset text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Confirm & Submit Report
              </button>
              <button onClick={emailPolice} className="w-full glass-strong text-sm py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-white/15">
                <Mail className="w-4 h-4" /> Email draft to police
              </button>
              <button onClick={() => setStep("input")} className="w-full text-xs text-muted-foreground py-1.5 hover:text-foreground">
                ← Edit report
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {step === "submitted" && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="glass-strong p-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-safe/20 grid place-items-center mb-4">
            <ShieldCheck className="w-10 h-10 text-safe" />
          </div>
          <h2 className="text-2xl font-bold">Report submitted ✓</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Your report is logged. You can email the AI-drafted complaint to police any time.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            <button onClick={emailPolice} className="bg-gradient-pink-blue text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email police now
            </button>
            <button onClick={restart} className="glass-strong px-4 py-2 rounded-lg text-sm font-semibold">
              + New report
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
