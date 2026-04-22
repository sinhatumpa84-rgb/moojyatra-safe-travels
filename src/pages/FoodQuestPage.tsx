import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPin, Camera, Award, Trophy, BookOpen, Flame } from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────────

const FOOD_TYPES: Record<string, { label: string; emoji: string; bg: string; txt: string }> = {
  fast:  { label: "Fast Food",  emoji: "⚡", bg: "#FF6B35", txt: "#fff" },
  fried: { label: "Fried",      emoji: "🍳", bg: "#FFD60A", txt: "#222" },
  drink: { label: "Drinkable",  emoji: "🥤", bg: "#4CC9F0", txt: "#222" },
  heavy: { label: "Heavy Meal", emoji: "🍛", bg: "#9B2335", txt: "#fff" },
};

interface Challenge {
  id: string; name: string; food: string; desc: string;
  location: string; type: string; xp: number; badge: string; badgeName: string;
}
interface State {
  id: string; name: string; emoji: string; color: string; tagline: string;
  challenges: Challenge[];
}

const STATES: State[] = [
  { id:"wb",  name:"West Bengal",       emoji:"🐟", color:"#C1121F", tagline:"City of Joy – Street Food Capital",
    challenges:[
      { id:"wb1", name:"Kathi Roll King",    food:"Kathi Roll",             desc:"Egg/Chicken roll from a street stall with green chutney",     location:"Park Street, Kolkata",       type:"fast",  xp:200, badge:"🥙", badgeName:"Roll Master" },
      { id:"wb2", name:"Puchka Pro",         food:"Puchka (Golgappa)",      desc:"Tamarind water-filled crispy puris",                          location:"Dalhousie Square, Kolkata",  type:"fast",  xp:150, badge:"💧", badgeName:"Puchka Hero" },
      { id:"wb3", name:"Sweet Bengal",       food:"Mishti Doi",             desc:"Fermented sweet yogurt in earthen pot",                       location:"New Market, Kolkata",        type:"drink", xp:120, badge:"🍮", badgeName:"Sweet Soul" },
      { id:"wb4", name:"Fish Curry Legend",  food:"Macher Jhol + Rice",     desc:"Light mustard fish curry with steamed rice",                  location:"Hatibagan, Kolkata",         type:"heavy", xp:250, badge:"🐠", badgeName:"Fish Legend" },
      { id:"wb5", name:"Chai & Muri Dawn",   food:"Kulhad Chai + Muri",    desc:"Clay pot tea with spiced puffed rice",                        location:"Howrah Bridge Area",         type:"drink", xp:100, badge:"☕", badgeName:"Chai Champ" },
    ]},
  { id:"pj",  name:"Punjab",            emoji:"🌾", color:"#FF9F1C", tagline:"Land of Five Rivers – Hearty & Bold",
    challenges:[
      { id:"pj1", name:"Chole Bhature Boss", food:"Chole Bhature",          desc:"Spicy chickpeas with fluffy deep-fried bread",               location:"Amritsar Old City",          type:"heavy", xp:220, badge:"🫓", badgeName:"Bhature Boss" },
      { id:"pj2", name:"Lassi King",         food:"Makhan Lassi",           desc:"Thick buttery sweet/salty yogurt drink",                     location:"Golden Temple Area",         type:"drink", xp:150, badge:"🥛", badgeName:"Lassi King" },
      { id:"pj3", name:"Sarson Royale",      food:"Sarson da Saag + Makki Roti", desc:"Mustard greens with cornflour flatbread & butter",      location:"Ludhiana Highway Dhaba",     type:"heavy", xp:280, badge:"🌿", badgeName:"Desi Royalty" },
      { id:"pj4", name:"Kulcha Quest",       food:"Amritsari Kulcha",       desc:"Stuffed tandoor-baked bread with chole & onions",            location:"Kesar Da Dhaba, Amritsar",   type:"heavy", xp:200, badge:"🫔", badgeName:"Kulcha Connoisseur" },
    ]},
  { id:"rj",  name:"Rajasthan",         emoji:"🏜️", color:"#E76F51", tagline:"Royal Flavors – Desert Spice",
    challenges:[
      { id:"rj1", name:"Dal Baati Royale",   food:"Dal Baati Churma",       desc:"Hard wheat balls + lentil curry + crushed sweet",            location:"Jaipur Old City Chowk",      type:"heavy", xp:300, badge:"🏺", badgeName:"Desert King" },
      { id:"rj2", name:"Mirchi Bada Dare",   food:"Mirchi Bada",            desc:"Giant chili stuffed with potato, deep fried in batter",      location:"Jodhpur Clock Tower Market", type:"fried", xp:180, badge:"🌶️", badgeName:"Fire Eater" },
      { id:"rj3", name:"Ghewar Gram",        food:"Ghewar",                 desc:"Crispy honeycomb sweet soaked in saffron sugar syrup",       location:"Pushkar Bazaar",             type:"fried", xp:160, badge:"🍯", badgeName:"Sweet Rajput" },
      { id:"rj4", name:"Chaach Challenge",   food:"Masala Chaach",          desc:"Spiced buttermilk with cumin, ginger & fresh mint",          location:"Udaipur Lake Pichola",       type:"drink", xp:120, badge:"🥄", badgeName:"Buttermilk Baron" },
    ]},
  { id:"mh",  name:"Maharashtra",       emoji:"🌊", color:"#E63946", tagline:"Vada Pav Nation – Spice & Soul",
    challenges:[
      { id:"mh1", name:"Vada Pav King",      food:"Vada Pav",               desc:"Mumbai's burger – potato fritter in bun with chutneys",      location:"Dadar Station, Mumbai",      type:"fast",  xp:200, badge:"🍔", badgeName:"Vada Pav King" },
      { id:"mh2", name:"Misal Madness",      food:"Misal Pav",              desc:"Fiery sprouted lentil curry with bread rolls",               location:"Pune Camp Area",             type:"heavy", xp:240, badge:"🌶️", badgeName:"Misal Maniac" },
      { id:"mh3", name:"Modak Mission",      food:"Modak",                  desc:"Steamed sweet coconut-jaggery rice dumpling",               location:"Girgaon, Mumbai",            type:"heavy", xp:180, badge:"🫧", badgeName:"Modak Devotee" },
      { id:"mh4", name:"Kokum Cooler",       food:"Kokum Sharbat",          desc:"Tangy purple kokum fruit cold drink",                        location:"Konkan Region Street",       type:"drink", xp:150, badge:"🍇", badgeName:"Kokum Guru" },
    ]},
  { id:"tn",  name:"Tamil Nadu",        emoji:"🌺", color:"#2D6A4F", tagline:"South's Pride – Idli to Chettinad",
    challenges:[
      { id:"tn1", name:"Idli Sambar Sunrise",food:"Idli + Sambar + Chutney",desc:"Steamed rice cakes with lentil soup & coconut chutney",      location:"Mylapore, Chennai",          type:"heavy", xp:200, badge:"⭕", badgeName:"Idli Icon" },
      { id:"tn2", name:"Filter Coffee Fix",  food:"Madras Filter Coffee",   desc:"Frothy chicory-coffee in steel tumbler, poured tall",        location:"Anna Nagar, Chennai",        type:"drink", xp:130, badge:"☕", badgeName:"Coffee Connoisseur" },
      { id:"tn3", name:"Dosa Dare",          food:"Masala Dosa",            desc:"Crispy fermented crepe with spiced potato filling",          location:"Triplicane, Chennai",        type:"fried", xp:220, badge:"🌯", badgeName:"Dosa Deva" },
      { id:"tn4", name:"Chettinad Feast",    food:"Chettinad Chicken Curry",desc:"Fiery black-pepper chettinad curry – India's hottest",       location:"Karaikudi, Chettinad",       type:"heavy", xp:300, badge:"🔥", badgeName:"Chettinad Champion" },
    ]},
  { id:"kl",  name:"Kerala",            emoji:"🥥", color:"#40916C", tagline:"God's Own Country – Coconut Kingdom",
    challenges:[
      { id:"kl1", name:"Appam & Stew",       food:"Appam + Vegetable Stew", desc:"Lacy rice pancake with creamy coconut milk stew",            location:"Fort Kochi Heritage Street", type:"heavy", xp:220, badge:"🥞", badgeName:"Appam Aficionado" },
      { id:"kl2", name:"Tender Coconut Chug",food:"Tender Coconut Water",   desc:"Fresh green coconut water straight off the tree",            location:"Kovalam Beach",              type:"drink", xp:100, badge:"🥥", badgeName:"Coconut King" },
      { id:"kl3", name:"Puttu Kadala",       food:"Puttu + Kadala Curry",   desc:"Steamed rice cylinders with black chickpea curry",           location:"Thrissur Market",            type:"heavy", xp:240, badge:"🧱", badgeName:"Kerala Legend" },
      { id:"kl4", name:"Sadya Survivor",     food:"Kerala Sadya (Feast)",   desc:"20+ dishes on banana leaf – the ultimate mega-meal",        location:"Guruvayur Temple Town",      type:"heavy", xp:400, badge:"🍌", badgeName:"Sadya Survivor" },
    ]},
  { id:"gj",  name:"Gujarat",           emoji:"🪁", color:"#E9C46A", tagline:"Sweet, Salty & Crispy – Jain Capital",
    challenges:[
      { id:"gj1", name:"Dhokla Delight",     food:"Khaman Dhokla",          desc:"Steamed fermented chickpea cake – soft, spongy, tangy",      location:"Manek Chowk, Ahmedabad",     type:"fast",  xp:160, badge:"🟡", badgeName:"Dhokla Dude" },
      { id:"gj2", name:"Fafda Jalebi Sunday",food:"Fafda + Jalebi",         desc:"Crispy gram strips with orange spiral fried sweet",          location:"Law Garden, Ahmedabad",      type:"fried", xp:200, badge:"🌀", badgeName:"Sunday Special" },
      { id:"gj3", name:"Aam Panna Refresh",  food:"Aam Panna",              desc:"Raw mango cooling drink with cumin & black salt",            location:"Rann of Kutch Stalls",       type:"drink", xp:130, badge:"🥭", badgeName:"Panna Pro" },
      { id:"gj4", name:"Undhiyu Ultimate",   food:"Undhiyu",                desc:"Winter mixed veg casserole cooked underground",             location:"Surat Food Street",          type:"heavy", xp:280, badge:"🫕", badgeName:"Undhiyu Uncle" },
    ]},
  { id:"goa", name:"Goa",              emoji:"🏖️", color:"#06D6A0", tagline:"Sun, Sand & Seafood",
    challenges:[
      { id:"go1", name:"Fish Curry Rice",    food:"Goan Fish Curry Rice",   desc:"Coconut-kokum fish curry with steamed rice",                 location:"Panaji Market, Goa",         type:"heavy", xp:250, badge:"🐡", badgeName:"Goa Gourmet" },
      { id:"go2", name:"Bebinca Bake",       food:"Bebinca",                desc:"16-layer coconut milk & egg Goan cake",                      location:"Old Goa Bakeries",           type:"heavy", xp:200, badge:"🎂", badgeName:"Bebinca Boss" },
      { id:"go3", name:"Kokum Chill",        food:"Kokum Juice",            desc:"Chilled sweet-sour kokum fruit cooler at the beach",         location:"Baga Beach Shacks",          type:"drink", xp:120, badge:"🌿", badgeName:"Beach Refresher" },
    ]},
  { id:"ka",  name:"Karnataka",        emoji:"🌴", color:"#7209B7", tagline:"Software & Spice – Udupi Universe",
    challenges:[
      { id:"ka1", name:"Bisi Bele Bath",     food:"Bisi Bele Bath",         desc:"Hot spiced lentil-rice casserole topped with ghee",          location:"Malleshwaram, Bengaluru",    type:"heavy", xp:260, badge:"🫕", badgeName:"Bisi Bele Boss" },
      { id:"ka2", name:"Mysore Pak Mission", food:"Mysore Pak",             desc:"Dense ghee-sugar-chickpea flour melt-sweet",                location:"Devaraja Market, Mysore",    type:"fried", xp:160, badge:"🟧", badgeName:"Pak Pro" },
      { id:"ka3", name:"Neer Dosa Float",    food:"Neer Dosa",              desc:"Paper-thin rice water crepe – almost translucent",           location:"Udupi Town",                 type:"fried", xp:180, badge:"⬜", badgeName:"Udupi Ustad" },
    ]},
  { id:"ts",  name:"Telangana",        emoji:"🍖", color:"#FF006E", tagline:"Hyderabadi Biryani Country",
    challenges:[
      { id:"ts1", name:"Biryani Bowl",       food:"Hyderabadi Dum Biryani", desc:"Slow-cooked layered saffron rice with meat",                location:"Old City, Hyderabad",        type:"heavy", xp:350, badge:"🍚", badgeName:"Biryani Baron" },
      { id:"ts2", name:"Mirchi Bajji Dare",  food:"Mirchi Bajji",           desc:"Giant stuffed chili fritter – Hyderabadi street staple",    location:"Charminar, Hyderabad",       type:"fried", xp:180, badge:"🌶️", badgeName:"Bajji Bhai" },
      { id:"ts3", name:"Irani Chai Ritual",  food:"Irani Chai + Osmania Biscuit", desc:"Slow-simmered milky tea with butter biscuit",         location:"Nimrah Cafe, Hyderabad",     type:"drink", xp:150, badge:"🍪", badgeName:"Irani Icon" },
    ]},
  { id:"as",  name:"Assam",            emoji:"🌿", color:"#43AA8B", tagline:"Tea Gardens & Tribal Traditions",
    challenges:[
      { id:"as1", name:"Masor Tenga",        food:"Masor Tenga",            desc:"Light sour fish curry with elephant apple",                  location:"Guwahati Fish Market",       type:"heavy", xp:240, badge:"🐟", badgeName:"Tenga Tiger" },
      { id:"as2", name:"Til Pitha Time",     food:"Til Pitha",              desc:"Sesame-jaggery stuffed crispy rice pitha",                   location:"Assam Village Fair",         type:"fried", xp:200, badge:"⚫", badgeName:"Pitha Pro" },
      { id:"as3", name:"Assam Tea First",    food:"Assam CTC Tea",          desc:"Strong aromatic black tea from finest gardens",              location:"Jorhat Tea Garden",          type:"drink", xp:120, badge:"🍵", badgeName:"Tea Master" },
    ]},
  { id:"up",  name:"Uttar Pradesh",    emoji:"🕌", color:"#D62828", tagline:"Nawabi Cuisine – Kebab Capital",
    challenges:[
      { id:"up1", name:"Tunday Kababi",      food:"Galouti Kebab",          desc:"160-spice melt-in-mouth minced meat kabab",                  location:"Aminabad, Lucknow",          type:"fast",  xp:300, badge:"🥩", badgeName:"Nawab Nashin" },
      { id:"up2", name:"Kachori Sabzi",      food:"Kachori + Aloo Sabzi",   desc:"Crispy stuffed fried bread with spiced potato gravy",        location:"Agra Sadar Bazaar",          type:"fried", xp:180, badge:"🔵", badgeName:"Kachori King" },
      { id:"up3", name:"Thandai Treat",      food:"Thandai (Non-Alcoholic)",desc:"Rose, dry fruits & milk cooling festival drink",             location:"Varanasi Ghats",             type:"drink", xp:160, badge:"🌹", badgeName:"Thandai Tiger" },
    ]},
  { id:"mp",  name:"Madhya Pradesh",   emoji:"🦁", color:"#BC4749", tagline:"Heart of India – Jungle Spice",
    challenges:[
      { id:"mp1", name:"Poha Bhopal",        food:"Bhopal Poha",            desc:"Flattened rice with sev, fennel & pomegranate seeds",        location:"Chowk Bazaar, Bhopal",       type:"fast",  xp:160, badge:"🌾", badgeName:"Poha Prince" },
      { id:"mp2", name:"Bhutte Ka Kees",     food:"Bhutte ka Kees",         desc:"Grated corn snack cooked with milk & spices",                location:"Indore Sarafa Bazaar",       type:"fast",  xp:180, badge:"🌽", badgeName:"Corn Commander" },
      { id:"mp3", name:"Indore Shikanji",    food:"Shikanji Lemonade",      desc:"Tangy spiced lemonade with black salt & cumin",              location:"Indore Rajwada Chowk",       type:"drink", xp:130, badge:"🍋", badgeName:"Shikanji Shark" },
    ]},
  { id:"hp",  name:"Himachal Pradesh", emoji:"⛰️", color:"#457B9D", tagline:"Mountain Magic – Cozy & Earthy",
    challenges:[
      { id:"hp1", name:"Siddu Secrets",      food:"Siddu",                  desc:"Stuffed wheat bread steamed on mountain fire",               location:"Manali Village Center",      type:"heavy", xp:220, badge:"⛰️", badgeName:"Hill Climber" },
      { id:"hp2", name:"Tudkiya Bhath",      food:"Tudkiya Bhath",          desc:"One-pot spiced rice with lentils & curd",                    location:"Chamba Hill Station",        type:"heavy", xp:200, badge:"🍱", badgeName:"Mountain Muncher" },
      { id:"hp3", name:"Buransh Bloom",      food:"Buransh Juice",          desc:"Rare Himalayan rhododendron flower juice",                   location:"Kullu Highlands",            type:"drink", xp:200, badge:"🌸", badgeName:"Forest Sipper" },
    ]},
  { id:"od",  name:"Odisha",           emoji:"🌊", color:"#F77F00", tagline:"Temple Coast – Ancient Flavors",
    challenges:[
      { id:"od1", name:"Dalma Discovery",    food:"Dalma",                  desc:"Lentils cooked with seasonal vegetables – temple prasad",    location:"Puri Temple Area",           type:"heavy", xp:220, badge:"🏛️", badgeName:"Dalma Devotee" },
      { id:"od2", name:"Chhena Poda",        food:"Chhena Poda",            desc:"Burnt cottage cheese sweet – caramelised perfection",        location:"Bhubaneswar Sweet Shop",     type:"heavy", xp:200, badge:"🔶", badgeName:"Chhena Champion" },
      { id:"od3", name:"Pakhala Bhata",      food:"Pakhala Bhata",          desc:"Fermented water rice with sun-dried sides",                  location:"Cuttack Old Town",           type:"heavy", xp:180, badge:"💧", badgeName:"Pakhala Pioneer" },
    ]},
];

const GAME_RULES = [
  { icon:"🚫", rule:"No alcohol items — all drinks must be strictly non-alcoholic" },
  { icon:"📍", rule:"GPS location must be confirmed before uploading food photo" },
  { icon:"📸", rule:"Photo must clearly show the food item for AI judge verification" },
  { icon:"⚡", rule:"Each challenge can only be completed once per session" },
  { icon:"🏆", rule:"XP awarded only after successful AI food verification" },
  { icon:"🌟", rule:"Bonus: Complete ALL challenges in one state = +500 XP State Master badge" },
  { icon:"🔥", rule:"Streak: 3 challenges in a row = 1.5× XP multiplier" },
  { icon:"👮", rule:"AI Food Judge verdict is final — no appeals!" },
];

const LEVELS = [
  { min:0,    name:"Street Snacker",    emoji:"🍟" },
  { min:500,  name:"Chai Explorer",     emoji:"☕" },
  { min:1200, name:"Spice Seeker",      emoji:"🌶️" },
  { min:2500, name:"Curry Connoisseur", emoji:"🍛" },
  { min:4500, name:"Biryani Baron",     emoji:"🍚" },
  { min:7000, name:"Food Maharaja",     emoji:"👑" },
];

const MOCK_LB = [
  { name:"RahulEats_MH",    xp:4280, badges:18, flag:"🌊" },
  { name:"FoodiePreeti_TN", xp:3650, badges:14, flag:"🌺" },
  { name:"KolkataKing",     xp:3200, badges:12, flag:"🐟" },
  { name:"SpiceMaster_RJ",  xp:2890, badges:11, flag:"🏜️" },
  { name:"DelhiDevourer",   xp:2400, badges:9,  flag:"🕌" },
];

type Screen = "home" | "state" | "challenge" | "leaderboard" | "badges" | "rules";
type Step = "gps" | "photo" | "verify" | "result";

interface Badge { emoji: string; name: string; state: string; food: string; }
interface Result { verified: boolean; message: string; confidence: string; }

// ─── Sub-components ────────────────────────────────────────────────────────────

function Tag({ type }: { type: string }) {
  const t = FOOD_TYPES[type];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: t.bg, color: t.txt }}>
      {t.emoji} {t.label}
    </span>
  );
}

function XPBar({ xp }: { xp: number }) {
  const lvl = LEVELS.reduce((a, l) => xp >= l.min ? l : a, LEVELS[0]);
  const nxt = LEVELS.find(l => l.min > xp) || LEVELS[LEVELS.length - 1];
  const pct = nxt.min > lvl.min ? Math.min(100, ((xp - lvl.min) / (nxt.min - lvl.min)) * 100) : 100;
  return (
    <div className="glass rounded-xl p-3 border border-orange-500/30">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-yellow-400 font-bold text-sm">{lvl.emoji} {lvl.name}</span>
        <span className="text-orange-400 font-extrabold text-sm">⚡ {xp.toLocaleString()} XP</span>
      </div>
      <div className="bg-black/40 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#FF6F00,#FFD700)" }} />
      </div>
      <div className="text-right text-[10px] text-white/40 mt-1">
        {nxt.min > lvl.min ? `${(nxt.min - xp).toLocaleString()} XP → ${nxt.emoji} ${nxt.name}` : "👑 MAX LEVEL"}
      </div>
    </div>
  );
}

// ─── Home Screen ───────────────────────────────────────────────────────────────

function HomeScreen({ xp, completedIds, earnedBadges, streak, onSelectState, onNav }:
  { xp: number; completedIds: Set<string>; earnedBadges: Badge[]; streak: number;
    onSelectState: (s: State) => void; onNav: (s: Screen) => void }) {
  const total = STATES.reduce((s, st) => s + st.challenges.length, 0);
  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="text-3xl font-extrabold gradient-text">🇮🇳 India Food Quest</h1>
            <p className="text-muted-foreground text-sm mt-1">Challenge · Earn XP · Climb Leaderboard</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {streak >= 2 && (
              <span className="flex items-center gap-1 bg-orange-500/20 border border-orange-500 rounded-full px-3 py-1 text-orange-400 text-xs font-bold">
                <Flame className="w-3.5 h-3.5" /> ×{streak}
              </span>
            )}
            {([["🏆", "leaderboard"], ["🎖️", "badges"], ["📋", "rules"]] as [string, Screen][]).map(([ic, sc]) => (
              <button key={sc} onClick={() => onNav(sc)}
                className="glass border border-yellow-500/30 rounded-full px-3 py-1 text-yellow-400 text-xs font-medium hover:bg-white/10 transition cursor-pointer">
                {ic} {sc.charAt(0).toUpperCase() + sc.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <XPBar xp={xp} />
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[{ l: "States", v: STATES.length, i: "🗺️" }, { l: "Done", v: completedIds.size, i: "✅" },
            { l: "Total", v: total, i: "🎯" }, { l: "Badges", v: earnedBadges.length, i: "🎖️" }].map(s => (
            <div key={s.l} className="glass rounded-xl p-2 text-center border border-orange-500/20">
              <div className="text-base">{s.i}</div>
              <div className="font-extrabold text-lg text-yellow-400">{s.v}</div>
              <div className="text-[9px] text-white/40">{s.l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* State grid */}
      <div>
        <p className="text-orange-400/70 text-[11px] font-bold uppercase tracking-widest mb-3">▶ Select a State to Explore</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {STATES.map((st, i) => {
            const done = st.challenges.filter(c => completedIds.has(c.id)).length;
            const all = st.challenges.length;
            const pct = Math.round((done / all) * 100);
            const full = done === all && all > 0;
            return (
              <motion.button key={st.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }} onClick={() => onSelectState(st)}
                className="glass-strong rounded-2xl p-3 text-left text-white hover:scale-[1.03] transition-transform relative overflow-hidden cursor-pointer"
                style={{ border: `2px solid ${full ? "#FFD700" : st.color}50`,
                  boxShadow: full ? `0 0 14px ${st.color}44` : undefined }}>
                {full && <span className="absolute top-2 right-2 text-xs">⭐</span>}
                <div className="text-2xl mb-1">{st.emoji}</div>
                <div className="font-extrabold text-sm mb-0.5">{st.name}</div>
                <div className="text-[9px] text-white/40 mb-2 leading-tight">{st.tagline}</div>
                <div className="bg-black/40 rounded-full h-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: st.color }} />
                </div>
                <div className="text-[9px] text-white/35 mt-1">{done}/{all} challenges</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── State Screen ──────────────────────────────────────────────────────────────

function StateScreen({ state, completedIds, onStart, onBack }:
  { state: State; completedIds: Set<string>; onStart: (c: Challenge) => void; onBack: () => void }) {
  return (
    <div className="container px-4 py-6">
      <button onClick={onBack}
        className="glass border border-white/20 rounded-full px-3 py-1.5 text-white/60 text-xs mb-5 flex items-center gap-1.5 hover:bg-white/10 transition cursor-pointer">
        <ChevronLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-5xl">{state.emoji}</span>
        <div>
          <h2 className="text-2xl font-extrabold" style={{ background: `linear-gradient(90deg,${state.color},#FFD700)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{state.name}</h2>
          <p className="text-white/45 text-xs">{state.tagline}</p>
        </div>
      </div>

      <p className="text-orange-400/70 text-[11px] font-bold uppercase tracking-widest mb-3">▶ Food Challenges</p>
      <div className="flex flex-col gap-3">
        {state.challenges.map(ch => {
          const done = completedIds.has(ch.id);
          return (
            <motion.div key={ch.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              className="glass-strong rounded-2xl p-4" style={{ opacity: done ? 0.75 : 1,
                border: `1px solid ${done ? "#FFD700" : "rgba(255,111,0,0.28)"}` }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{ch.badge}</span>
                    <span className="font-extrabold text-sm">{ch.name}</span>
                    {done && <span className="text-yellow-400 text-xs">✅</span>}
                  </div>
                  <Tag type={ch.type} />
                </div>
                <div className="glass rounded-lg px-3 py-1.5 text-center border border-yellow-400/30 shrink-0">
                  <div className="text-yellow-400 font-extrabold text-base">+{ch.xp}</div>
                  <div className="text-white/40 text-[9px]">XP</div>
                </div>
              </div>
              <p className="text-white/60 text-xs mb-1.5">🍽️ <strong className="text-white">{ch.food}</strong> — {ch.desc}</p>
              <p className="text-orange-400/65 text-xs mb-3">📍 {ch.location}</p>
              <button onClick={() => !done && onStart(ch)} disabled={done}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition cursor-pointer disabled:cursor-not-allowed"
                style={{ background: done ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg,${state.color},#FF6F00)`,
                  color: done ? "rgba(255,255,255,0.25)" : "#fff", border: "none" }}>
                {done ? "✅ Completed" : "🚀 Start Challenge →"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Challenge Screen ──────────────────────────────────────────────────────────

function ChallengeScreen({ state, challenge, step, gpsOk, gpsChecking, photo, result,
  onGPS, onPhotoNext, onFileChange, onVerify, onBack, onRetry, onDone, fileRef }:
  { state: State; challenge: Challenge; step: Step; gpsOk: boolean; gpsChecking: boolean;
    photo: string | null; result: Result | null; onGPS: () => void; onPhotoNext: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onVerify: () => void;
    onBack: () => void; onRetry: () => void; onDone: () => void;
    fileRef: React.RefObject<HTMLInputElement | null> }) {
  const steps = ["gps", "photo", "verify", "result"];
  const stepIdx = steps.indexOf(step);
  const stepLabels = ["📍 GPS", "📸 Photo", "🤖 AI Judge", "🏆 Result"];

  return (
    <div className="container px-4 py-6">
      <button onClick={onBack}
        className="glass border border-white/20 rounded-full px-3 py-1.5 text-white/55 text-xs mb-5 flex items-center gap-1.5 hover:bg-white/10 transition cursor-pointer">
        <ChevronLeft className="w-3.5 h-3.5" /> {state.name}
      </button>

      <h2 className="text-2xl font-extrabold gradient-text mb-1">{challenge.badge} {challenge.name}</h2>

      {/* Step bar */}
      <div className="flex gap-1.5 mt-3 mb-1">
        {stepLabels.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= stepIdx ? (i === stepIdx ? "#FF6F00" : "#FFD700") : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      <div className="flex gap-1.5 mb-6">
        {stepLabels.map((s, i) => (
          <div key={i} className="flex-1 text-center text-[9px]"
            style={{ color: i === stepIdx ? "#FF6F00" : i < stepIdx ? "#FFD700" : "rgba(255,255,255,0.25)" }}>{s}</div>
        ))}
      </div>

      {/* Challenge card */}
      <div className="glass-strong rounded-2xl p-4 mb-6 border border-orange-500/28">
        <div className="mb-2"><Tag type={challenge.type} /></div>
        <p className="font-extrabold text-base mb-1">🍽️ {challenge.food}</p>
        <p className="text-white/60 text-xs mb-2">{challenge.desc}</p>
        <p className="text-orange-400/75 text-xs mb-3">📍 <strong className="text-yellow-400">{challenge.location}</strong></p>
        <span className="glass rounded-lg px-3 py-1.5 text-xs border border-yellow-400/30">
          <strong className="text-yellow-400">+{challenge.xp} XP</strong>
          <span className="text-white/35 ml-2">{challenge.badge} {challenge.badgeName}</span>
        </span>
      </div>

      {/* GPS step */}
      {step === "gps" && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📍</div>
          <h3 className="font-extrabold text-xl mb-2">Confirm Your Location</h3>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            Head to <strong className="text-yellow-400">{challenge.location}</strong><br />then tap below to verify GPS
          </p>
          {!gpsOk ? (
            <button onClick={onGPS} disabled={gpsChecking}
              className="bg-gradient-to-br from-orange-500 to-orange-400 text-white font-bold text-base px-10 py-4 rounded-2xl shadow-glow-pink transition hover:scale-105 cursor-pointer disabled:opacity-60">
              {gpsChecking ? "🌐 Checking GPS…" : "📍 I'm Here — Confirm GPS"}
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-green-400 font-bold text-sm">✅ Location Confirmed!</p>
              <div className="glass rounded-xl p-3 border border-green-400 text-green-400 text-sm">
                🎉 Welcome to {challenge.location}!
              </div>
              <button onClick={onPhotoNext}
                className="bg-gradient-to-br from-orange-500 to-yellow-400 text-white font-bold px-8 py-3 rounded-xl cursor-pointer transition hover:scale-105">
                📸 Next: Upload Food Photo →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Photo step */}
      {step === "photo" && (
        <div className="text-center">
          <div className="text-5xl mb-3">📸</div>
          <h3 className="font-extrabold text-xl mb-2">Upload Your Food Photo</h3>
          <p className="text-white/45 text-sm mb-4 leading-relaxed">
            Take a clear photo of <strong className="text-yellow-400">{challenge.food}</strong><br />The AI judge will verify it!
          </p>
          <div className="glass rounded-2xl p-5 mb-4 cursor-pointer border-2 border-dashed border-orange-500/40 hover:border-orange-400 transition"
            onClick={() => fileRef.current?.click()}>
            {photo ? (
              <img src={photo} alt="food" className="max-w-full max-h-48 rounded-xl object-cover mx-auto" />
            ) : (
              <div>
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-orange-400/65 font-bold text-sm">Tap to Upload Photo</p>
                <p className="text-white/25 text-xs mt-1">JPG · PNG · WEBP</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()}
              className="flex-1 glass border border-orange-500 text-orange-400 font-bold py-2.5 rounded-xl text-sm cursor-pointer hover:bg-orange-500/10 transition">
              {photo ? "🔄 Change" : "📂 Choose Photo"}
            </button>
            {photo && (
              <button onClick={onVerify}
                className="flex-[2] bg-gradient-to-br from-orange-500 to-yellow-400 text-white font-extrabold py-2.5 rounded-xl text-sm cursor-pointer shadow-glow-pink hover:scale-[1.02] transition">
                🤖 Submit to AI Judge →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Verifying step */}
      {step === "verify" && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4 inline-block animate-spin">🤖</div>
          <h3 className="font-extrabold text-xl mb-2">AI Food Judge Analyzing…</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            Checking your photo for<br /><strong className="text-yellow-400">{challenge.food}</strong>…
          </p>
          {photo && (
            <img src={photo} alt="" className="w-24 h-24 object-cover rounded-xl mx-auto mt-4 opacity-50 border border-orange-500/35" />
          )}
        </div>
      )}

      {/* Result step */}
      {step === "result" && result && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="text-6xl mb-3">{result.verified ? "🎉" : "😔"}</div>
            <h3 className="font-extrabold text-2xl mb-3" style={{ color: result.verified ? "#FFD700" : "#FF6B6B" }}>
              {result.verified ? "CHALLENGE COMPLETE!" : "NOT VERIFIED"}
            </h3>
            <div className={`glass rounded-2xl p-4 mb-4 text-sm leading-relaxed border ${result.verified ? "border-green-400 text-green-300" : "border-red-400 text-red-300"}`}>
              {result.message}
            </div>
            {result.verified && (
              <div className="glass rounded-2xl p-4 mb-4 border-2 border-yellow-400">
                <div className="text-4xl">{challenge.badge}</div>
                <div className="text-yellow-400 font-extrabold text-2xl">+{challenge.xp} XP</div>
                <div className="text-white/65 text-xs mt-1">🎖️ Badge Unlocked: <strong className="text-yellow-400">{challenge.badgeName}</strong></div>
              </div>
            )}
            {photo && <img src={photo} alt="" className="w-20 h-20 object-cover rounded-xl mx-auto mb-4 border border-orange-500/35" />}
            <div className="flex gap-2">
              {!result.verified && (
                <button onClick={onRetry}
                  className="flex-1 glass border border-orange-500 text-orange-400 font-bold py-2.5 rounded-xl text-sm cursor-pointer hover:bg-orange-500/10 transition">
                  🔄 Try Again
                </button>
              )}
              <button onClick={onDone}
                className="flex-[2] bg-gradient-to-br from-orange-500 to-yellow-400 text-white font-extrabold py-2.5 rounded-xl text-sm cursor-pointer hover:scale-[1.02] transition">
                {result.verified ? "🎉 Back to Challenges" : "← Back to State"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Leaderboard Screen ────────────────────────────────────────────────────────

function LeaderboardScreen({ xp, earnedBadges, onBack }:
  { xp: number; earnedBadges: Badge[]; onBack: () => void }) {
  const me = { name: "YOU", xp, badges: earnedBadges.length, flag: "⭐" };
  const lb = [...MOCK_LB, me].sort((a, b) => b.xp - a.xp);
  const myRank = lb.findIndex(p => p.name === "YOU") + 1;
  return (
    <div className="container px-4 py-6">
      <button onClick={onBack}
        className="glass border border-white/20 rounded-full px-3 py-1.5 text-white/60 text-xs mb-5 flex items-center gap-1.5 hover:bg-white/10 transition cursor-pointer">
        <ChevronLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-extrabold gradient-text">Leaderboard</h2>
      </div>
      <p className="text-white/40 text-xs mb-5">Your rank: #{myRank}</p>
      <div className="flex flex-col gap-2">
        {lb.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 glass-strong rounded-xl px-4 py-3 border ${p.name === "YOU" ? "border-yellow-400" : "border-orange-500/18"}`}>
            <div className="font-extrabold text-lg w-7 text-center"
              style={{ color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "rgba(255,255,255,0.35)" }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
            </div>
            <span className="text-xl">{p.flag}</span>
            <div className="flex-1">
              <p className="font-bold text-sm">{p.name}</p>
              <p className="text-white/35 text-xs">🎖️ {p.badges} badges</p>
            </div>
            <div className="font-extrabold text-yellow-400 text-base">⚡{p.xp.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Badges Screen ─────────────────────────────────────────────────────────────

function BadgesScreen({ earnedBadges, onBack }:
  { earnedBadges: Badge[]; onBack: () => void }) {
  return (
    <div className="container px-4 py-6">
      <button onClick={onBack}
        className="glass border border-white/20 rounded-full px-3 py-1.5 text-white/60 text-xs mb-5 flex items-center gap-1.5 hover:bg-white/10 transition cursor-pointer">
        <ChevronLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div className="flex items-center gap-2 mb-5">
        <Award className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-extrabold gradient-text">My Badges</h2>
        <span className="text-orange-400/50 font-semibold">({earnedBadges.length})</span>
      </div>
      {earnedBadges.length === 0 ? (
        <div className="text-center py-16 text-white/25">
          <div className="text-5xl mb-4">🎖️</div>
          <p>Complete challenges to earn badges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {earnedBadges.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-strong rounded-2xl p-4 text-center border border-yellow-400/28">
              <div className="text-4xl mb-2">{b.emoji}</div>
              <p className="font-extrabold text-xs text-yellow-400 mb-1">{b.name}</p>
              <p className="text-white/35 text-[10px]">{b.state}</p>
              <p className="text-orange-400/55 text-[10px] mt-1">{b.food}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rules Screen ──────────────────────────────────────────────────────────────

function RulesScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="container px-4 py-6">
      <button onClick={onBack}
        className="glass border border-white/20 rounded-full px-3 py-1.5 text-white/60 text-xs mb-5 flex items-center gap-1.5 hover:bg-white/10 transition cursor-pointer">
        <ChevronLeft className="w-3.5 h-3.5" /> Back
      </button>
      <div className="flex items-center gap-2 mb-5">
        <BookOpen className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-extrabold gradient-text">Game Rules</h2>
      </div>
      <div className="flex flex-col gap-2 mb-5">
        {GAME_RULES.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-strong rounded-xl px-4 py-3 flex gap-3 items-start border border-orange-500/22">
            <span className="text-xl shrink-0">{r.icon}</span>
            <span className="text-white/75 text-xs leading-relaxed">{r.rule}</span>
          </motion.div>
        ))}
      </div>
      <div className="glass-strong rounded-2xl p-4 border border-orange-500/28">
        <p className="font-extrabold text-orange-400 text-sm mb-2">🤖 How AI Verification Works</p>
        <p className="text-white/55 text-xs leading-relaxed">
          When you upload a food photo, Claude AI acts as your personal Food Judge. It examines the image, checks if it matches
          the required dish, and gives an instant verdict. The AI recognizes Indian street food, regional specialties,
          drinks, and snacks — and will reject alcohol, wrong foods, or stock photo submissions!
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function FoodQuestPage() {
  const [screen, setScreen]       = useState<Screen>("home");
  const [selState, setSelState]   = useState<State | null>(null);
  const [activeC, setActiveC]     = useState<Challenge | null>(null);
  const [step, setStep]           = useState<Step>("gps");
  const [completedIds, setDone]   = useState<Set<string>>(new Set());
  const [xp, setXp]               = useState(0);
  const [badges, setBadges]       = useState<Badge[]>([]);
  const [streak, setStreak]       = useState(0);
  const [gpsOk, setGpsOk]        = useState(false);
  const [gpsChecking, setGpsChk] = useState(false);
  const [photo, setPhoto]         = useState<string | null>(null);
  const [result, setResult]       = useState<Result | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const handleGPS = () => {
    if (gpsOk) return;
    setGpsChk(true);
    const done = () => { setGpsChk(false); setGpsOk(true); };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(done, () => setTimeout(done, 2000));
    } else {
      setTimeout(done, 2200);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhoto(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const handleVerify = async () => {
    if (!photo || !activeC || !selState) return;
    setStep("verify");
    try {
      const base64    = photo.split(",")[1];
      const mediaType = photo.split(";")[0].split(":")[1];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 300,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text:
`You are a strict but fun Indian food challenge judge.
CHALLENGE: "${activeC.name}" | STATE: ${selState.name}
REQUIRED FOOD: ${activeC.food}
DESCRIPTION: ${activeC.desc}
RULES: No alcohol. Must be real food photo. Must match the dish.

Look at the image. Does it show the required food?
Respond ONLY with valid JSON (no markdown):
If yes: {"verified":true,"message":"Short encouraging message mentioning the food name. Max 2 sentences.","confidence":"high"}
If no:  {"verified":false,"message":"Friendly note on what went wrong and what to try. Max 2 sentences.","confidence":"low"}` }
          ]}]
        })
      });
      const data = await res.json();
      const txt  = (data.content || []).map((i: any) => i.text || "").join("").replace(/```json|```/g, "").trim();
      const parsed: Result = JSON.parse(txt);
      setResult(parsed);
      if (parsed.verified) {
        const mult   = streak >= 2 ? 1.5 : 1;
        const gained = Math.round(activeC.xp * mult);
        setXp(p => p + gained);
        setStreak(p => p + 1);
        setDone(p => new Set([...p, activeC.id]));
        setBadges(p => [...p, { emoji: activeC.badge, name: activeC.badgeName, state: selState.name, food: activeC.food }]);
      } else {
        setStreak(0);
      }
    } catch {
      setResult({ verified: false, message: "Verification failed — please try again.", confidence: "low" });
    }
    setStep("result");
  };

  const startChallenge = (ch: Challenge) => {
    setActiveC(ch);
    setStep("gps");
    setGpsOk(false);
    setPhoto(null);
    setResult(null);
    setScreen("challenge");
  };

  const navTo = (s: Screen) => setScreen(s);

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HomeScreen xp={xp} completedIds={completedIds} earnedBadges={badges}
              streak={streak} onSelectState={st => { setSelState(st); setScreen("state"); }} onNav={navTo} />
          </motion.div>
        )}
        {screen === "state" && selState && (
          <motion.div key="state" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <StateScreen state={selState} completedIds={completedIds}
              onStart={startChallenge} onBack={() => setScreen("home")} />
          </motion.div>
        )}
        {screen === "challenge" && activeC && selState && (
          <motion.div key="challenge" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <ChallengeScreen state={selState} challenge={activeC} step={step}
              gpsOk={gpsOk} gpsChecking={gpsChecking} photo={photo} result={result}
              onGPS={handleGPS} onPhotoNext={() => setStep("photo")}
              onFileChange={handleFileChange} onVerify={handleVerify}
              onBack={() => setScreen("state")}
              onRetry={() => { setPhoto(null); setResult(null); setStep("photo"); }}
              onDone={() => setScreen("state")} fileRef={fileRef} />
          </motion.div>
        )}
        {screen === "leaderboard" && (
          <motion.div key="lb" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <LeaderboardScreen xp={xp} earnedBadges={badges} onBack={() => setScreen("home")} />
          </motion.div>
        )}
        {screen === "badges" && (
          <motion.div key="badges" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <BadgesScreen earnedBadges={badges} onBack={() => setScreen("home")} />
          </motion.div>
        )}
        {screen === "rules" && (
          <motion.div key="rules" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <RulesScreen onBack={() => setScreen("home")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
