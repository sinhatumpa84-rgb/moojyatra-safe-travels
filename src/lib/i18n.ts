// 24-language UI translator. Falls back to English when a key is missing.
export type Lang =
  | "en" | "hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "ml" | "pa" | "or" | "as"
  | "ur" | "es" | "fr" | "de" | "it" | "pt" | "ru" | "zh" | "ja" | "ko" | "ar" | "tr";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
  { code: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳" },
  { code: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "or", label: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "as", label: "অসমীয়া", flag: "🇮🇳" },
  { code: "ur", label: "اردو", flag: "🇵🇰" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

export function detectLang(text: string): Lang {
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml";
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa";
  if (/[\u0B00-\u0B7F]/.test(text)) return "or";
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh";
  if (/[\u3040-\u30FF]/.test(text)) return "ja";
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko";
  if (/[\u0400-\u04FF]/.test(text)) return "ru";
  return "en";
}

type Dict = Record<string, string>;

const en: Dict = {
  home: "Home", map: "Live Map", prices: "Price Truth", guides: "Guides", nearby: "Nearby",
  sos: "SOS", report: "Report Scam", chat: "YatraBot", leaderboard: "Leaderboard", visit: "Submit Visit",
  tagline: "Travel India without getting scammed.",
  sub: "Real prices. Real guides. Real safety. Powered by AI + your community.",
  cta: "Explore the map", cta2: "Check real prices",
};

// Translations for navbar + tagline. Other UI text falls back to English automatically.
export const t: Record<Lang, Dict> = {
  en,
  hi: { ...en, home: "होम", map: "लाइव नक्शा", prices: "असली कीमतें", nearby: "पास के स्थान", sos: "एसओएस", report: "धोखाधड़ी रिपोर्ट", chat: "यात्राबॉट", leaderboard: "लीडरबोर्ड", visit: "यात्रा दर्ज करें", tagline: "बिना ठगे भारत घूमिए।", sub: "असली कीमतें। असली गाइड। असली सुरक्षा।", cta: "नक्शा देखें", cta2: "कीमतें देखें" },
  bn: { ...en, home: "হোম", map: "লাইভ ম্যাপ", prices: "সঠিক দাম", nearby: "কাছাকাছি", sos: "এসওএস", report: "প্রতারণা রিপোর্ট", chat: "যাত্রাবট", leaderboard: "লিডারবোর্ড", visit: "ভ্রমণ জমা দিন", tagline: "ভারত ঘুরুন প্রতারণা ছাড়াই।", sub: "সঠিক দাম। সঠিক গাইড। সঠিক নিরাপত্তা।", cta: "ম্যাপ দেখুন", cta2: "দাম দেখুন" },
  ta: { ...en, home: "முகப்பு", map: "வரைபடம்", prices: "விலை", nearby: "அருகில்", sos: "எஸ்ஓஎஸ்", report: "புகார்", chat: "யாத்ராபாட்", leaderboard: "தலைவர்கள்", visit: "வருகை சமர்ப்பி", tagline: "மோசடி இல்லாமல் இந்தியா பயணம்.", sub: "உண்மையான விலை. உண்மையான பாதுகாப்பு.", cta: "வரைபடம் பார்", cta2: "விலை பார்" },
  te: { ...en, home: "హోమ్", map: "మ్యాప్", prices: "ధరలు", nearby: "సమీపంలో", sos: "ఎస్ఓఎస్", report: "నివేదిక", chat: "యాత్రాబాట్", leaderboard: "లీడర్‌బోర్డ్", visit: "సందర్శన ఇవ్వండి", tagline: "మోసం లేకుండా భారతదేశం పర్యటించండి.", sub: "నిజమైన ధరలు. నిజమైన భద్రత.", cta: "మ్యాప్ చూడండి", cta2: "ధరలు చూడండి" },
  mr: { ...en, home: "मुख्यपृष्ठ", map: "नकाशा", prices: "किंमती", nearby: "जवळ", sos: "एसओएस", report: "तक्रार", chat: "यात्राबॉट", leaderboard: "लीडरबोर्ड", visit: "भेट सबमिट करा", tagline: "फसवणूक न होता भारत फिरा.", sub: "खऱ्या किंमती. खरी सुरक्षितता.", cta: "नकाशा पहा", cta2: "किंमती पहा" },
  gu: { ...en, home: "હોમ", map: "નકશો", prices: "ભાવ", nearby: "નજીક", sos: "એસઓએસ", report: "ફરિયાદ", chat: "યાત્રાબોટ", leaderboard: "લીડરબોર્ડ", visit: "મુલાકાત નોંધો", tagline: "છેતરપિંડી વગર ભારત ફરો.", sub: "સાચા ભાવ. સાચી સલામતી.", cta: "નકશો જુઓ", cta2: "ભાવ જુઓ" },
  kn: { ...en, home: "ಮುಖಪುಟ", map: "ನಕ್ಷೆ", prices: "ಬೆಲೆಗಳು", nearby: "ಹತ್ತಿರ", sos: "ಎಸ್‌ಒಎಸ್", report: "ವರದಿ", chat: "ಯಾತ್ರಾಬಾಟ್", leaderboard: "ಲೀಡರ್‌ಬೋರ್ಡ್", visit: "ಭೇಟಿ ಸಲ್ಲಿಸಿ", tagline: "ಮೋಸವಿಲ್ಲದೆ ಭಾರತ ಪ್ರಯಾಣ.", sub: "ನಿಜವಾದ ಬೆಲೆ. ನಿಜವಾದ ಸುರಕ್ಷತೆ.", cta: "ನಕ್ಷೆ ನೋಡಿ", cta2: "ಬೆಲೆ ನೋಡಿ" },
  ml: { ...en, home: "ഹോം", map: "മാപ്പ്", prices: "വില", nearby: "സമീപം", sos: "എസ്ഒഎസ്", report: "റിപ്പോർട്ട്", chat: "യാത്രാബോട്ട്", leaderboard: "ലീഡർബോർഡ്", visit: "സന്ദർശനം നൽകൂ", tagline: "വഞ്ചനയില്ലാതെ ഇന്ത്യ സഞ്ചരിക്കൂ.", sub: "യഥാർത്ഥ വില. യഥാർത്ഥ സുരക്ഷ.", cta: "മാപ്പ് കാണുക", cta2: "വില കാണുക" },
  pa: { ...en, home: "ਘਰ", map: "ਨਕਸ਼ਾ", prices: "ਕੀਮਤਾਂ", nearby: "ਨੇੜੇ", sos: "ਐਸਓਐਸ", report: "ਰਿਪੋਰਟ", chat: "ਯਾਤਰਾਬੋਟ", leaderboard: "ਲੀਡਰਬੋਰਡ", visit: "ਯਾਤਰਾ ਦਰਜ ਕਰੋ", tagline: "ਠੱਗੇ ਬਿਨਾਂ ਭਾਰਤ ਘੁੰਮੋ.", sub: "ਅਸਲ ਕੀਮਤਾਂ. ਅਸਲ ਸੁਰੱਖਿਆ.", cta: "ਨਕਸ਼ਾ ਵੇਖੋ", cta2: "ਕੀਮਤਾਂ ਵੇਖੋ" },
  or: { ...en, home: "ଘର", map: "ମ୍ୟାପ୍", prices: "ଦାମ", nearby: "ନିକଟ", sos: "ଏସଓଏସ୍", report: "ରିପୋର୍ଟ", chat: "ଯାତ୍ରାବଟ୍", leaderboard: "ଲିଡର୍‌ବୋର୍ଡ", visit: "ଯାତ୍ରା ଦାଖଲ", tagline: "ଠକାମିଶୂନ୍ୟ ଭାରତ ଭ୍ରମଣ.", sub: "ପ୍ରକୃତ ଦାମ. ପ୍ରକୃତ ସୁରକ୍ଷା.", cta: "ମ୍ୟାପ୍ ଦେଖନ୍ତୁ", cta2: "ଦାମ ଦେଖନ୍ତୁ" },
  as: { ...en, home: "ঘৰ", map: "মেপ", prices: "দাম", nearby: "ওচৰত", sos: "এছঅএছ", report: "প্ৰতিবেদন", chat: "যাত্ৰাবট", leaderboard: "লিডাৰবৰ্ড", visit: "ভ্ৰমণ দিয়ক", tagline: "প্ৰতাৰণা নোহোৱাকৈ ভাৰত ভ্ৰমণ.", sub: "প্ৰকৃত দাম. প্ৰকৃত সুৰক্ষা.", cta: "মেপ চাওক", cta2: "দাম চাওক" },
  ur: { ...en, home: "ہوم", map: "نقشہ", prices: "قیمتیں", nearby: "قریب", sos: "ایس او ایس", report: "رپورٹ", chat: "یاتراباٹ", leaderboard: "لیڈربورڈ", visit: "دورہ جمع کریں", tagline: "دھوکہ کھائے بغیر بھارت گھومیں.", sub: "حقیقی قیمتیں۔ حقیقی تحفظ۔", cta: "نقشہ دیکھیں", cta2: "قیمتیں دیکھیں" },
  es: { ...en, home: "Inicio", map: "Mapa", prices: "Precios", nearby: "Cerca", sos: "SOS", report: "Reportar", chat: "YatraBot", leaderboard: "Clasificación", visit: "Enviar visita", tagline: "Viaja la India sin estafas.", sub: "Precios reales. Seguridad real.", cta: "Ver el mapa", cta2: "Ver precios" },
  fr: { ...en, home: "Accueil", map: "Carte", prices: "Prix", nearby: "À proximité", sos: "SOS", report: "Signaler", chat: "YatraBot", leaderboard: "Classement", visit: "Soumettre visite", tagline: "Voyagez en Inde sans arnaque.", sub: "Vrais prix. Vraie sécurité.", cta: "Voir la carte", cta2: "Voir les prix" },
  de: { ...en, home: "Start", map: "Karte", prices: "Preise", nearby: "In der Nähe", sos: "SOS", report: "Melden", chat: "YatraBot", leaderboard: "Bestenliste", visit: "Besuch einreichen", tagline: "Indien bereisen, ohne abgezockt zu werden.", sub: "Echte Preise. Echte Sicherheit.", cta: "Karte ansehen", cta2: "Preise ansehen" },
  it: { ...en, home: "Home", map: "Mappa", prices: "Prezzi", nearby: "Vicino", sos: "SOS", report: "Segnala", chat: "YatraBot", leaderboard: "Classifica", visit: "Invia visita", tagline: "Viaggia in India senza truffe.", sub: "Prezzi reali. Sicurezza reale.", cta: "Vedi la mappa", cta2: "Vedi i prezzi" },
  pt: { ...en, home: "Início", map: "Mapa", prices: "Preços", nearby: "Perto", sos: "SOS", report: "Denunciar", chat: "YatraBot", leaderboard: "Ranking", visit: "Enviar visita", tagline: "Viaje pela Índia sem golpes.", sub: "Preços reais. Segurança real.", cta: "Ver o mapa", cta2: "Ver preços" },
  ru: { ...en, home: "Главная", map: "Карта", prices: "Цены", nearby: "Рядом", sos: "SOS", report: "Сообщить", chat: "ЯтраБот", leaderboard: "Рейтинг", visit: "Отправить визит", tagline: "Путешествуйте по Индии без обмана.", sub: "Реальные цены. Реальная безопасность.", cta: "Открыть карту", cta2: "Цены" },
  zh: { ...en, home: "首页", map: "地图", prices: "价格", nearby: "附近", sos: "SOS", report: "举报", chat: "YatraBot", leaderboard: "排行榜", visit: "提交访问", tagline: "畅游印度,远离骗局。", sub: "真实价格。真实安全。", cta: "查看地图", cta2: "查看价格" },
  ja: { ...en, home: "ホーム", map: "マップ", prices: "価格", nearby: "近く", sos: "SOS", report: "報告", chat: "YatraBot", leaderboard: "ランキング", visit: "訪問を送信", tagline: "詐欺のないインド旅行。", sub: "本物の価格。本物の安全。", cta: "マップを見る", cta2: "価格を見る" },
  ko: { ...en, home: "홈", map: "지도", prices: "가격", nearby: "근처", sos: "SOS", report: "신고", chat: "YatraBot", leaderboard: "리더보드", visit: "방문 제출", tagline: "사기 없이 인도 여행하기.", sub: "진짜 가격. 진짜 안전.", cta: "지도 보기", cta2: "가격 보기" },
  ar: { ...en, home: "الرئيسية", map: "الخريطة", prices: "الأسعار", nearby: "قريب", sos: "نجدة", report: "بلاغ", chat: "ياتراباوت", leaderboard: "المتصدرون", visit: "إرسال زيارة", tagline: "سافر في الهند دون احتيال.", sub: "أسعار حقيقية. أمان حقيقي.", cta: "عرض الخريطة", cta2: "عرض الأسعار" },
  tr: { ...en, home: "Ana sayfa", map: "Harita", prices: "Fiyatlar", nearby: "Yakın", sos: "SOS", report: "Bildir", chat: "YatraBot", leaderboard: "Liderlik", visit: "Ziyaret gönder", tagline: "Dolandırılmadan Hindistan'ı gezin.", sub: "Gerçek fiyatlar. Gerçek güvenlik.", cta: "Haritayı aç", cta2: "Fiyatları gör" },
};
