import { useOutletContext, Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroScene from "@/components/HeroScene";
import { LangCtx } from "@/lib/types";
import { t } from "@/lib/i18n";
import { ShieldCheck, MapPin, IndianRupee, Bot, ShieldAlert, AlertTriangle, Sparkles, Camera, Loader2, AlertCircle } from "lucide-react";
import CurrencyTiles from "@/components/CurrencyTiles";
import WeatherWidget from "@/components/WeatherWidget";
import NewsFeed from "@/components/NewsFeed";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "@/contexts/LocationContext";

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
  const { searchedLocation, isSearching } = useLocation();

  return (
    <div className="w-full px-3 sm:px-4">
      {/* Hero */}
      <section className="relative grid lg:grid-cols-2 gap-6 sm:gap-8 items-center min-h-[75vh] sm:min-h-[80vh] py-6 sm:py-8">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-90 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 glass px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-primary-glow mb-4 sm:mb-5">
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Anti-scam · Multilingual · Open data
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight sm:leading-[0.95] tracking-tight">
            <span className="gradient-text">{tt.tagline}</span>
          </h1>
          <p className="mt-3 sm:mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">{tt.sub}</p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
            <Link to="/map" className="bg-gradient-pink-blue text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-glow-pink hover:scale-[1.02] transition text-sm sm:text-base text-center">
              {tt.cta} →
            </Link>
            <Link to="/prices" className="glass-strong text-foreground font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-white/15 transition text-sm sm:text-base text-center">
              {tt.cta2}
            </Link>
          </div>
          <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-2 sm:gap-3 max-w-md">
            {[
              { n: "28", l: "States" },
              { n: "100+", l: "Real prices" },
              { n: "AI", l: "Legal help" },
            ].map((s) => (
              <div key={s.l} className="glass px-2.5 sm:px-4 py-2.5 sm:py-3 text-center">
                <div className="text-xl sm:text-2xl font-bold gradient-text">{s.n}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="hidden lg:block h-[420px] lg:h-[560px] relative">
          <HeroScene />
        </div>
      </section>

      {/* Currency tiles */}
      <section className="my-12 sm:my-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Live currency to <span className="gradient-text">INR</span></h2>
          <span className="text-xs sm:text-sm text-muted-foreground">Updated daily · open.er-api</span>
        </div>
        <CurrencyTiles />
      </section>

      {/* Weather + Live News */}
      <section className="my-12 sm:my-16 grid lg:grid-cols-2 gap-3 sm:gap-5">
        {isSearching ? (
          <div className="glass-strong p-5 flex items-center justify-center gap-2 min-h-[120px]">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Fetching weather...</span>
          </div>
        ) : searchedLocation ? (
          <WeatherWidget lat={searchedLocation.lat} lng={searchedLocation.lng} label={searchedLocation.name} />
        ) : (
          <div className="glass-strong p-5 border border-destructive/30 flex items-center gap-2 text-destructive text-sm font-semibold min-h-[120px]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Location not found. Search a city to see weather.</span>
          </div>
        )}

        {isSearching ? (
          <div className="glass-strong p-5 flex items-center justify-center gap-2 min-h-[120px]">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Fetching live news...</span>
          </div>
        ) : searchedLocation ? (
          <NewsFeed city={searchedLocation.name} />
        ) : (
          <div className="glass-strong p-5 border border-destructive/30 flex items-center gap-2 text-destructive text-sm font-semibold min-h-[120px]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Location not found. Search a city to see live safety news.</span>
          </div>
        )}
      </section>

      {/* Features grid */}
      <section className="my-16 sm:my-20">
        <h2 className="text-2.5xl sm:text-3xl lg:text-4xl font-bold mb-1.5 sm:mb-2">Everything in one safety net.</h2>
        <p className="text-xs sm:text-base text-muted-foreground mb-6 sm:mb-8">10 modules. Zero scams (we hope).</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={f.to} className="block glass-strong p-4 sm:p-5 lg:p-6 h-full hover:scale-[1.02] hover:shadow-glow-pink transition group">
                <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${f.color} grid place-items-center mb-3 sm:mb-4 shadow-lg`}>
                  <f.icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:gradient-text">{f.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="my-16 sm:my-20 text-center glass-strong p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl">
        <ShieldCheck className="w-10 sm:w-12 h-10 sm:h-12 text-safe mx-auto mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Travel like you belong.</h2>
        <p className="text-xs sm:text-base text-muted-foreground mt-2 max-w-xl mx-auto">
          Not as a target. Join the community keeping Indian travel honest, kind and safe.
        </p>
        <Link to="/report" className="inline-block mt-4 sm:mt-6 bg-gradient-sunset text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-glow-pink text-sm sm:text-base">
          Report a scam → earn a badge
        </Link>
      </section>
    </div>
  );
}
