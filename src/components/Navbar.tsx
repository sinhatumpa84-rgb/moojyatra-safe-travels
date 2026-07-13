import { Link, NavLink } from "react-router-dom";
import { Map, ShieldAlert, Sparkles, Users, MessageCircle, IndianRupee, Trophy, AlertTriangle, Camera, Globe, UtensilsCrossed, Plane, User as UserIcon, Menu, X } from "lucide-react";
import { Lang, t, LANGUAGES } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/AuthDialog";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const navItems = [
  { to: "/", icon: Sparkles, key: "home" },
  { to: "/map", icon: Map, key: "map" },
  { to: "/prices", icon: IndianRupee, key: "prices" },
  { to: "/nearby", icon: Users, key: "nearby" },
  { to: "/visit", icon: Camera, key: "visit" },
  { to: "/report", icon: AlertTriangle, key: "report" },
  { to: "/sos", icon: ShieldAlert, key: "sos" },
  { to: "/leaderboard", icon: Trophy, key: "leaderboard" },
  { to: "/food-quest", icon: UtensilsCrossed, key: "foodQuest" },
];

export default function Navbar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const tt = t[lang];
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    const isRtlLang = lang === "ar" || lang === "ur";
    setIsRtl(isRtlLang);
    const htmlEl = document.getElementById("root-html");
    if (htmlEl) {
      htmlEl.setAttribute("dir", isRtlLang ? "rtl" : "ltr");
      htmlEl.setAttribute("lang", lang);
    }
  }, [lang]);

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-4 pt-2 sm:pt-4 w-full">
      <div className="w-full glass-strong flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl gap-2 sm:gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-sunset grid place-items-center font-black text-sm sm:text-base text-white shadow-glow-pink">
            <Plane className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold tracking-tight gradient-text text-base sm:text-lg">MoojYatra</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">Anti-scam travel</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto flex-1 ml-4">
          {navItems.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isActive ? "bg-primary/20 text-primary-glow" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{(tt as any)[key] ?? key}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Selector - Mobile optimized */}
          <div className="relative flex items-center">
            <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 absolute ltr:left-2 rtl:right-2 text-muted-foreground pointer-events-none" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="bg-white/10 text-foreground text-xs sm:text-sm rounded-lg ltr:pl-7 rtl:pr-7 ltr:pr-2 rtl:pl-2 py-1.5 border border-white/10 outline-none max-w-[80px] sm:max-w-[110px] appearance-none cursor-pointer hover:bg-white/15 transition"
              title="Choose language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>

          {/* Chat Button - Desktop */}
          <NavLink to="/chat" className="hidden sm:flex items-center gap-1.5 bg-gradient-pink-blue text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold shadow-glow-pink hover:opacity-90 transition">
            <MessageCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden md:inline">{tt.chat}</span>
          </NavLink>

          {/* Profile / Auth - Desktop */}
          {user ? (
            <NavLink to="/profile" className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-gradient-sunset grid place-items-center text-white font-bold text-xs sm:text-sm shadow-glow-pink shrink-0 hidden sm:grid" title="Profile">
              {(user.email || "U")[0].toUpperCase()}
            </NavLink>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="hidden sm:flex glass px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold items-center gap-1 hover:bg-white/15 transition">
              <UserIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden md:inline">Sign in</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition" title="Menu">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side={isRtl ? "right" : "left"} className="w-72 sm:w-80">
              <div className="flex items-center justify-between mb-6 mt-6">
                <span className="font-extrabold text-lg gradient-text">Menu</span>
                <SheetClose asChild>
                  <button className="p-1 hover:bg-white/10 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </SheetClose>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-1 mb-6">
                {navItems.map(({ to, icon: Icon, key }) => (
                  <SheetClose key={to} asChild>
                    <NavLink
                      to={to}
                      end={to === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                          isActive ? "bg-primary/20 text-primary-glow" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{(tt as any)[key] ?? key}</span>
                    </NavLink>
                  </SheetClose>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <SheetClose asChild>
                  <NavLink to="/chat" className="flex items-center gap-2 bg-gradient-pink-blue text-white w-full px-3 py-2.5 rounded-lg text-sm font-semibold shadow-glow-pink hover:opacity-90 transition">
                    <MessageCircle className="w-4 h-4" />
                    {tt.chat}
                  </NavLink>
                </SheetClose>

                {user ? (
                  <SheetClose asChild>
                    <NavLink to="/profile" className="flex items-center gap-2 glass w-full px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/15 transition">
                      <div className="w-5 h-5 rounded-full bg-gradient-sunset grid place-items-center text-white text-xs font-bold">
                        {(user.email || "U")[0].toUpperCase()}
                      </div>
                      Profile
                    </NavLink>
                  </SheetClose>
                ) : (
                  <button
                    onClick={() => {
                      setAuthOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 glass w-full px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/15 transition"
                  >
                    <UserIcon className="w-4 h-4" />
                    Sign in
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
