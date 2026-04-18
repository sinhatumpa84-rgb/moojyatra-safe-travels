import { useOutletContext, Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroScene from "@/components/HeroScene";
import { LangCtx } from "@/lib/types";
import { t } from "@/lib/i18n";
import { ShieldCheck, MapPin, IndianRupee, Bot, ShieldAlert, AlertTriangle, Sparkles, Camera } from "lucide-react";
import CurrencyTiles from "@/components/CurrencyTiles";
import WeatherWidget from "@/components/WeatherWidget";
import NewsFeed from "@/components/NewsFeed";
import { useEffect, useState } from "react";

const features = [
  { icon: IndianRupee, color: "from-pink-400 to-purple-500", title: "Price Truth DB", desc: "See local vs tourist vs official price for 100+ items across 8 cities. Crowdsourced, AI-verified.", to: "/prices" },
  { icon: MapPin, color: "from-blue-400 to-emerald-400", title: "Live Smart Map", desc: "Real-time map with scam zones, weather, news. Click to drop a manual pin anywhere in India.", to: "/map" },
  { icon: ShieldAlert, color: "from-red-500 to-orange-400", title: "One-tap SOS", desc: "Send live location to emergency contacts. 112, 1091, embassies — one button.", to: "/sos" },
  { icon: Bot, color: "from-purple-500 to-blue-500", title: "YatraBot AI", desc: "Multilingual chatbot. Scam advice, legal help, prices, anything travel.", to: "/chat" },
  { icon: Camera, color: "from-yellow-400 to-pink-400", title: "Nearby Famous Places", desc: "Auto-discover monuments, temples, museums near you. Check in to earn points & badges.", to: "/nearby" },
  { icon: AlertTriangle, color: "from-orange-500 to-red-500", title: "AI Scam Report", desc: "Voice or text + photo. AI maps to IPC sections and drafts a complaint to police.", to: "/report" },
];

export default function Home() {
  const { lang } = useOutletContext<LangCtx>();
  const tt = t[lang];
  const [pos, setPos] = useState<[number, number]>([28.6139, 77.2090]);
  const [city, setCity] = useState("Delhi");

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => {
      setPos([p.coords.latitude, p.coords.longitude]);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.coords.latitude}&lon=${p.coords.longitude}&zoom=10`)
        .then((r) => r.json())
        .then((d) => {
          const a = d?.address || {};
          setCity(a.city || a.town || a.village || a.state || "your area");
        }).catch(() => {});
    }, () => {}, { timeout: 5000 });
  }, []);

  return (
    <div className="container px-4">
      {/* Hero */}
      <section className="relative grid lg:grid-cols-2 gap-8 items-center min-h-[80vh] py-8">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-90 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 glass px-3 py-1.5 text-xs font-medium text-primary-glow mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Anti-scam · Multilingual · Open data
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight">
            <span className="gradient-text">{tt.tagline}</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl">{tt.sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/map" className="bg-gradient-pink-blue text-white font-semibold px-6 py-3 rounded-xl shadow-glow-pink hover:scale-[1.02] transition">
              {tt.cta} →
            </Link>
            <Link to="/prices" className="glass-strong text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-white/15 transition">
              {tt.cta2}
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
            {[
              { n: "8", l: "Cities" },
              { n: "100+", l: "Real prices" },
              { n: "AI", l: "Legal help" },
            ].map((s) => (
              <div key={s.l} className="glass px-4 py-3 text-center">
                <div className="text-2xl font-bold gradient-text">{s.n}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="h-[420px] lg:h-[560px] relative">
          <HeroScene />
        </div>
      </section>

      {/* Currency tiles */}
      <section className="my-16">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-3xl font-bold">Live currency to <span className="gradient-text">INR</span></h2>
          <span className="text-xs text-muted-foreground">Updated daily · open.er-api</span>
        </div>
        <CurrencyTiles />
      </section>

      {/* Weather + Live News */}
      <section className="my-16 grid lg:grid-cols-2 gap-5">
        <WeatherWidget lat={pos[0]} lng={pos[1]} label={city} />
        <NewsFeed city={city} />
      </section>

      {/* Features grid */}
      <section className="my-20">
        <h2 className="text-4xl font-bold mb-2">Everything in one safety net.</h2>
        <p className="text-muted-foreground mb-8">10 modules. Zero scams (we hope).</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={f.to} className="block glass-strong p-6 h-full hover:scale-[1.02] hover:shadow-glow-pink transition group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} grid place-items-center mb-4 shadow-lg`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:gradient-text">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="my-20 text-center glass-strong p-10">
        <ShieldCheck className="w-12 h-12 text-safe mx-auto mb-4" />
        <h2 className="text-3xl font-bold">Travel like you belong.</h2>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Not as a target. Join the community keeping Indian travel honest, kind and safe.
        </p>
        <Link to="/report" className="inline-block mt-6 bg-gradient-sunset text-white font-semibold px-6 py-3 rounded-xl shadow-glow-pink">
          Report a scam → earn a badge
        </Link>
      </section>
    </div>
  );
}
