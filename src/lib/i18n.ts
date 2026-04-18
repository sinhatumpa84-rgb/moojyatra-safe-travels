// Lightweight regex-based language detection for EN / HI / BN
export type Lang = "en" | "hi" | "bn";

export function detectLang(text: string): Lang {
  if (/[\u0980-\u09FF]/.test(text)) return "bn"; // Bengali
  if (/[\u0900-\u097F]/.test(text)) return "hi"; // Devanagari
  return "en";
}

export const t: Record<Lang, Record<string, string>> = {
  en: {
    home: "Home", map: "Live Map", prices: "Price Truth", guides: "Guides", nearby: "Nearby",
    sos: "SOS", report: "Report Scam", chat: "YatraBot",
    tagline: "Travel India without getting scammed.",
    sub: "Real prices. Real guides. Real safety. Powered by AI + your community.",
    cta: "Explore the map", cta2: "Check real prices",
  },
  hi: {
    home: "होम", map: "लाइव नक्शा", prices: "असली कीमतें", guides: "गाइड", nearby: "पास के स्थान",
    sos: "एसओएस", report: "धोखाधड़ी रिपोर्ट", chat: "यात्राबॉट",
    tagline: "बिना ठगे भारत घूमिए।",
    sub: "असली कीमतें। असली गाइड। असली सुरक्षा। AI और समुदाय द्वारा संचालित।",
    cta: "नक्शा देखें", cta2: "कीमतें देखें",
  },
  bn: {
    home: "হোম", map: "লাইভ ম্যাপ", prices: "সঠিক দাম", guides: "গাইড", nearby: "কাছাকাছি",
    sos: "এসওএস", report: "প্রতারণা রিপোর্ট", chat: "যাত্রাবট",
    tagline: "ভারত ঘুরুন প্রতারণা ছাড়াই।",
    sub: "সঠিক দাম। সঠিক গাইড। সঠিক নিরাপত্তা। AI ও কমিউনিটি দ্বারা চালিত।",
    cta: "ম্যাপ দেখুন", cta2: "দাম দেখুন",
  },
};
