import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Camera, MapPin, Sparkles, ChevronRight, Lock, ShieldAlert, ShieldCheck, Shield, SearchCheck, Landmark, Tent, MountainSnow, Swords, Handshake, Users, X, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// Custom SVG Icons natively integrated for absolute premium visual quality
const SvgIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "taj": return <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10"><path d="M12 2C12 2 8 8 8 13C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13C16 8 12 2 12 2ZM6 12V22M18 12V22M4 22H20M12 17V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "temple": return <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10"><path d="M12 2L15 7H9L12 2ZM5 12H19V22H5V12ZM19 12L22 17H2L5 12ZM12 17V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "hampi": return <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10"><path d="M5 21V7M19 21V7M3 7H21M8 21V11M16 21V11M3 21H21M12 2L6 7H18L12 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    default: return <Landmark className="w-10 h-10 text-white" strokeWidth={1.5} />;
  }
};

const OFFICIAL_BADGES = [
  // Travel Category
  { id: "taj", name: "Taj Mahal Visitor", type: "travel", points: 150, icon: "taj", desc: "Visited the symbol of love" },
  { id: "golden", name: "Golden Pilgrim", type: "travel", points: 200, icon: "temple", desc: "Prayed at the Golden Temple" },
  { id: "hampi", name: "Hampi Explorer", type: "travel", points: 300, icon: "hampi", desc: "Wandered the ancient ruins" },
  
  // Anti-Scam Category (Red/Orange Theme, High Points)
  { id: "scam_1", name: "Scam Spotter", type: "scam", points: 100, icon: "shield_bronze", desc: "Awarded for 1st verified scam report" },
  { id: "scam_2", name: "City Guardian", type: "scam", points: 500, icon: "shield_silver", desc: "Awarded for 10 verified reports" },
  { id: "scam_3", name: "Shield of India", type: "scam", points: 1500, icon: "shield_gold", desc: "Awarded for 50+ reports" },
];

const CountUp = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = display;
    if (start === value) return;
    const dur = 1500;
    const startTime = performance.now();
    const animate = (curr: number) => {
      const p = Math.min((curr - startTime) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.floor(start + (value - start) * ease));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => setDisplay(value);
  }, [value]);
  return <>{display}</>;
};

const getLevel = (pts: number) => {
  const titles = ["Wanderer", "Explorer", "Adventurer", "Pathfinder", "Voyager", "Trailblazer", "Yatri Master", "Legend"];
  const level = Math.floor(pts / 100) + 1;
  const title = titles[Math.min(Math.floor(pts / 100), titles.length - 1)];
  const progress = (pts % 100);
  return { level, title, progress, next: 100 };
};

export default function LeaderboardPage() {
  const [dbProfiles, setDbProfiles] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [compareUser, setCompareUser] = useState<any | null>(null);
  
  const [myPoints, setMyPoints] = useState(() => Number(localStorage.getItem("mooj_points") || "0"));

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
    supabase.from("profiles").select("*").order("points", { ascending: false }).limit(20).then(({ data }) => setDbProfiles(data || []));
    supabase.from("badges").select("*").order("points", { ascending: false }).then(({ data }) => setBadges(data || []));
    supabase.from("visited_places").select("*").order("created_at", { ascending: false }).limit(12).then(({ data }) => setVisits(data || []));

    const timer = setInterval(() => {
        const local = Number(localStorage.getItem("mooj_points") || "0");
        if (local > myPoints) setMyPoints(local);
    }, 2000);
    return () => clearInterval(timer);
  }, [myPoints]);

  const profiles = useMemo(() => {
     let list = dbProfiles.map(p => ({ ...p, mockBadges: Math.floor((p.points || 0) / 100) }));
     if (userId) {
       let me = list.find(p => p.id === userId || p.user_id === userId);
       if (me) me.points = Math.max(me.points || 0, myPoints);
       else if (myPoints > 0) list.push({ id: userId, display_name: "You", points: myPoints, mockBadges: Math.floor(myPoints/100) });
     } else if (myPoints > 0) {
       list.push({ id: "guest", display_name: "You (Guest)", points: myPoints, mockBadges: Math.floor(myPoints/100) });
     }
     list.sort((a,b) => b.points - a.points);
     return Array.from(new Map(list.map(item => [item.id, item])).values()).slice(0, 20);
  }, [dbProfiles, myPoints, userId]);

  const podiumClasses = (i: number) => {
    if (i === 0) return "border-[#FFD700] bg-[#FFD700]/10 shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]";
    if (i === 1) return "border-[#C0C0C0] bg-[#C0C0C0]/10 shadow-[0_0_15px_rgba(192,192,192,0.3)] hover:shadow-[0_0_25px_rgba(192,192,192,0.5)]";
    if (i === 2) return "border-[#CD7F32] bg-[#CD7F32]/10 shadow-[0_0_15px_rgba(205,127,50,0.3)] hover:shadow-[0_0_25px_rgba(205,127,50,0.5)]";
    return "border-white/10 glass hover:bg-white/10 hover:border-white/30";
  };

  const getThemeClass = (type: string, isUnlocked: boolean) => {
    if (!isUnlocked) return "bg-white/5 border-white/5 grayscale opacity-60 backdrop-blur-sm";
    return type === "scam" 
      ? "bg-gradient-to-br from-[#ff6b6b]/40 to-[#c0392b]/40 border-[#ff6b6b]/60 shadow-[0_4px_30px_rgba(255,107,107,0.4)]"
      : "bg-gradient-to-br from-[#6e8efb]/40 to-[#a777e3]/40 border-white/30 shadow-[0_4px_30px_rgba(167,119,227,0.4)]";
  };

  const getIcon = (icon: string) => {
    if (icon === "scam_bronze") return <SearchCheck className="w-9 h-9 text-[#CD7F32]" strokeWidth={2} />;
    if (icon === "shield_silver") return <ShieldCheck className="w-9 h-9 text-[#C0C0C0]" strokeWidth={2} />;
    if (icon === "shield_gold") return <ShieldAlert className="w-9 h-9 text-[#FFD700]" strokeWidth={2} />;
    return <SvgIcon name={icon} />;
  };

  // Profile Comparison Modal
  const renderCompareModal = () => (
    <AnimatePresence>
      {compareUser && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
          <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-strong max-w-lg w-full p-6 rounded-2xl relative border-2 border-white/20 shadow-glow-blue overflow-hidden">
            <button onClick={() => setCompareUser(null)} className="absolute top-4 right-4 text-white/50 hover:text-white glass p-1.5 rounded-full"><X className="w-5 h-5"/></button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Activity className="text-secondary" /> Head-to-Head</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8 relative">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-white/10"></div>
              <div className="text-center p-3">
                <div className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">You</div>
                <div className="text-3xl font-extrabold gradient-text leading-tight">{myPoints}</div>
                <div className="text-xs text-white/60 mb-2 mt-1">pts</div>
              </div>
              <div className="text-center p-3">
                <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1 text-ellipsis overflow-hidden whitespace-nowrap">{compareUser.display_name}</div>
                <div className="text-3xl font-extrabold text-white leading-tight">{compareUser.points}</div>
                <div className="text-xs text-white/60 mb-2 mt-1">pts</div>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold text-white/80 uppercase">Unlocked Badges</span>
               </div>
               <div className="flex justify-between items-center relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                 <div className="absolute top-0 bottom-0 left-0 bg-secondary" style={{ width: `${Math.min((myPoints / 2500)* 100, 100)}%` }}></div>
                 <div className="absolute top-0 bottom-0 right-0 bg-primary" style={{ width: `${Math.min((compareUser.points / 2500)* 100, 100)}%` }}></div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const unifiedBadges = useMemo(() => {
    const list = [...OFFICIAL_BADGES];
    const officialNames = new Set(OFFICIAL_BADGES.map(b => b.name.toLowerCase()));
    
    badges.forEach(b => {
      if (!officialNames.has(b.name.toLowerCase())) {
        list.push({
          id: b.id,
          name: b.name,
          type: "travel",
          points: b.points || 50,
          icon: b.icon || "🏅",
          desc: b.description || "A travel milestone"
        });
      }
    });
    return list.sort((a, b) => a.points - b.points);
  }, [badges]);

  return (
    <div className="container px-4 py-6">
      {renderCompareModal()}

      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2 drop-shadow-md"><Trophy className="text-warn w-8 h-8" /> Rank & Badges</h1>
          <p className="text-sm text-muted-foreground mt-1">Protect India from scams. Earn global respect.</p>
        </div>
        <Link to="/visit" className="bg-gradient-pink-blue hover:bg-gradient-to-r hover:from-pink-500 hover:to-blue-500 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-glow-pink animate-pulse transition">
          <Camera className="w-5 h-5" /> Submit a visit
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Top Traveler Area */}
        <div className="glass-strong p-6 rounded-2xl">
          <h2 className="font-bold mb-4 flex items-center gap-2 text-xl"><Sparkles className="w-6 h-6 text-primary" /> Top travelers</h2>
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading top warriors...</p>
          ) : (
            <ol className="space-y-3">
              {profiles.map((p, i) => {
                const lvl = getLevel(p.points || 0);
                return (
                  <motion.li key={p.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                    onClick={() => p.id !== userId && p.id !== "guest" ? setCompareUser(p) : null}
                    className={`p-3.5 rounded-[1.25rem] flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden transition-all duration-300 border-2 cursor-pointer transform hover:-translate-y-1 ${podiumClasses(i)}`}>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-xl shadow-inner border border-white/20
                        ${i === 0 ? "bg-[#FFD700] text-black" : i === 1 ? "bg-[#C0C0C0] text-black" : i === 2 ? "bg-[#CD7F32] text-black" : "bg-black/30 text-white/80"}`}>
                        #{i + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-end justify-between">
                          <div className="font-extrabold text-base tracking-tight">{p.display_name || "Anonymous Yatri"}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 whitespace-nowrap">
                          <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">{lvl.title}</span>
                          <div className="w-[80px] h-1 bg-black/40 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-gradient-pink-blue" style={{ width: `${(lvl.progress / lvl.next) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 ml-auto pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                      {/* Mini Badge Preview */}
                      <div className="flex -space-x-2">
                        {Array.from({length: Math.min(3, p.mockBadges || 1)}).map((_, idx) => (
                           <div key={idx} className="w-7 h-7 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-md">
                             <Shield className="w-3.5 h-3.5 text-white/80"/>
                           </div>
                        ))}
                      </div>
                      <div className="text-lg font-black tracking-tight text-right w-[90px]"><CountUp value={p.points} /></div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Global Badges Gamification View */}
        <div className="glass-strong p-6 rounded-2xl flex flex-col h-[700px]">
          <div className="flex items-center justify-between mb-2">
             <h2 className="font-bold flex items-center gap-2 text-xl"><ShieldCheck className="w-6 h-6 text-safe" /> Badge Collection</h2>
             <div className="text-xs bg-black/40 px-3 py-1.5 rounded-full font-bold border border-white/10 uppercase tracking-wider text-safe">{myPoints} pts</div>
          </div>
          <p className="text-xs text-white/50 mb-6 font-medium leading-relaxed">Report scams inside MoojYatra to earn heavily weighted Anti-Scam badges alongside your travel trophies.</p>
          
          <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-6 flex-1">
            {unifiedBadges.map((b, i) => {
              const u = myPoints >= b.points;
              return (
                <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className={`relative group flex flex-col items-center justify-center p-5 rounded-[1.5rem] transition-all duration-300 ease-in-out border-2 overflow-hidden
                    ${u ? "hover:scale-105 cursor-pointer" : ""} ${getThemeClass(b.type, u)}`}>
                  
                  {/* Dynamic Shimmer and Overlay */}
                  {u ? (
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-shimmer z-0 pointer-events-none" />
                  ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-20 backdrop-blur-[2px]">
                       <Lock className="w-8 h-8 text-white/20 mb-2" />
                       <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{b.points} PTR REQ</div>
                     </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 z-10 relative shadow-inner
                     ${b.type === "scam" ? "bg-red-950/40 border border-red-500/20" : "bg-black/30 border border-white/10"}`}>
                    <span className="drop-shadow-lg scale-110">{getIcon(b.icon)}</span>
                  </div>
                  
                  <div className={`font-black text-xs text-center leading-tight mb-1 z-10 ${b.type === "scam" && u ? "text-red-100" : "text-white"}`}>
                    {b.name}
                  </div>
                  <div className="text-[9px] text-center text-white/60 mb-3 z-10 min-h-[25px] leading-tight px-2">{b.desc}</div>
                  
                  <div className={`text-[9px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full z-10 shadow-md border 
                     ${u ? (b.type === "scam" ? "bg-red-600 border-red-400 text-white" : "bg-gradient-pink-blue border-white/20 text-white") : "bg-black text-white/30 border-transparent"}`}>
                     {u ? "Unlocked" : `Locked`}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
