import { useEffect, useRef, useState, useCallback } from "react";

// Web Speech API hook — works in Chrome/Edge/Safari. Free, no API key.
type SR = any;

export function useVoiceInput(lang = "en-IN") {
  const recRef = useRef<SR | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const r: SR = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = lang;
    r.onresult = (e: any) => {
      let final = "", inter = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += txt + " ";
        else inter += txt;
      }
      if (final) setTranscript((t) => (t + " " + final).trim());
      setInterim(inter);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recRef.current = r;
    return () => { try { r.stop(); } catch { /* ignore */ } };
  }, [lang]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    setInterim("");
    try { recRef.current.start(); setListening(true); } catch { /* already started */ }
  }, []);

  const stop = useCallback(() => {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch { /* ignore */ }
    setListening(false);
  }, []);

  const reset = useCallback(() => { setTranscript(""); setInterim(""); }, []);

  return { listening, transcript, interim, supported, start, stop, reset, setTranscript };
}
