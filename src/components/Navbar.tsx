import { Link, NavLink, useLocation } from "react-router-dom";
import { Map, ShieldAlert, Sparkles, Users, MessageCircle, IndianRupee, Trophy, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Lang, t } from "@/lib/i18n";

const navItems = [
  { to: "/", icon: Sparkles, key: "home" },
  { to: "/map", icon: Map, key: "map" },
  { to: "/prices", icon: IndianRupee, key: "prices" },
  { to: "/nearby", icon: Users, key: "nearby" },
  { to: "/report", icon: AlertTriangle, key: "report" },
  { to: "/sos", icon: ShieldAlert, key: "sos" },
  { to: "/leaderboard", icon: Trophy, key: "leaderboard" },
];

export default function Navbar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const tt = t[lang];
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="container glass-strong flex items-center justify-between px-4 py-3 rounded-2xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-sunset grid place-items-center font-black text-base text-white shadow-glow-pink">M</div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold tracking-tight gradient-text text-lg">MoojYatra</span>
            <span className="text-[10px] text-muted-foreground">Anti-scam travel</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive ? "bg-primary/20 text-primary-glow" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{(tt as any)[key] ?? key}</span>
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="bg-white/10 text-foreground text-xs rounded-lg px-2 py-1.5 border border-white/10 outline-none"
          >
            <option value="en">EN</option>
            <option value="hi">हि</option>
            <option value="bn">বা</option>
          </select>
          <NavLink to="/chat" className="flex items-center gap-1.5 bg-gradient-pink-blue text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-glow-pink hover:opacity-90">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{tt.chat}</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
