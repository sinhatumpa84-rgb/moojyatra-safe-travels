// Verified Moojyatra context to ground Groq in authentic Indian travel reality

export const MOOJYATRA_VERIFIED_DATA = {
  emergencyHelplines: {
    nationalEmergency: "112",
    womenHelpline: "1091",
    police: "100",
    touristHelpline: "1363 (24x7 Multi-lingual, Govt of India)",
    railwayHelpline: "139",
  },
  knownScams: [
    {
      name: "Auto/Taxi Meter Refusal & Overcharging",
      cities: ["Delhi", "Agra", "Jaipur", "Varanasi", "Mumbai", "Kolkata"],
      tactic: "Driver claims meter is broken or demands 3x-5x the local rate. At train stations/airports, unauthorized touts divert tourists from official prepaid counters.",
      prevention: "Always insist on government prepaid taxi/auto booths, official app cabs (Uber/Ola/Yatri), or meter by law (Delhi auto minimum ₹30 for first 1.5 km, ₹11/km after; Mumbai ₹23 min).",
    },
    {
      name: "Closed Monument / Fake Government Office",
      cities: ["Delhi (Connaught Place)", "Agra", "Jaipur"],
      tactic: "Touts or drivers claim the monument or railway ticket office is closed for a festival/VIP visit, and offer to take you to a 'Govt Approved Emporium' or agency.",
      prevention: "Monuments follow strict official ASI timings (sunrise to sunset). Government ticket counters do not relocate. Check official ASI website or booking portal.",
    },
    {
      name: "Unlicensed Guides & Commission Shopping Traps",
      cities: ["Agra (Taj Mahal)", "Jaipur", "Varanasi", "Hampi"],
      tactic: "Friendly strangers offer 'free' tours or guide services, then aggressively steer tourists to souvenir/marble/carpet shops charging 5x-10x markups for kickbacks.",
      prevention: "Only hire guides with official Ministry of Tourism or State Tourism photo badges with license numbers. Never feel pressured to buy items.",
    },
    {
      name: "Fake Aarti Donation / Temple Blessings Extortion",
      cities: ["Varanasi (Ghats)", "Pushkar", "Haridwar"],
      tactic: "Priests hand flowers or tie red threads (raksha sutra) claiming it is free, then demand ₹1,000–₹5,000 as mandatory 'dakshina' or curse the traveler.",
      prevention: "Politely refuse unwanted flowers/threads upfront with 'Nahi chahiye'. Genuine temple donations are voluntary and receipted at the temple trust desk.",
    },
    {
      name: "Shoe Shine / Bird Poop Trick",
      cities: ["Delhi (Paharganj, CP)", "Kolkata (New Market)"],
      tactic: "Substance squirted onto traveler's footwear unnoticed, then an 'innocent' vendor offers shoe cleaning and demands exorbitant fees.",
      prevention: "Do not stop or let anyone touch your shoes; walk firmly to your destination.",
    }
  ],
  priceBenchmarks: {
    transport: {
      autoRickshaw: "₹30-50 for first 1.5-2 km, then ₹11-15 per subsequent km. Metro tickets: ₹10-60 depending on distance.",
      cityBus: "₹5-25 for standard city routes; ₹20-50 for AC buses.",
      appCabs: "₹15-22 per km for standard hatchback/sedan.",
    },
    food: {
      streetSnacks: "Puchka/Golgappa: ₹20-40 (6 pcs); Chai in kulhad: ₹10-20; Kathi roll: ₹50-120; Vada Pav: ₹15-30.",
      thaliMeals: "Local veg thali: ₹80-160; Non-veg / special thali: ₹150-350; Mid-range restaurant meal: ₹250-500 per person.",
    },
    monumentTickets: {
      domesticIndian: "₹20-50 for most ASI monuments (Taj Mahal ₹50, Red Fort ₹35, Qutub Minar ₹40).",
      foreignTourist: "₹300-1100 for ASI monuments (Taj Mahal ₹1,100 + ₹200 for main mausoleum).",
    },
    budgetTiersDaily: {
      budgetBackpacker: "₹800 - ₹1,500/day (Hostel dorm, street food/thalis, metro/buses, public sightseeing)",
      midRangeExplorer: "₹2,500 - ₹5,000/day (3-star hotel/homestay, app cabs/autos, heritage dining, guided tours)",
      comfortTraveler: "₹6,000 - ₹12,000+/day (Heritage hotel/resort, private chauffeur cab, fine dining, private guides)",
    }
  },
  popularHubs: [
    "Delhi", "Agra", "Jaipur", "Varanasi", "Kolkata", "Mumbai", 
    "Bengaluru", "Kochi", "Amritsar", "Udaipur", "Goa", "Hampi"
  ]
};

export function getPromptGroundingContext(destination?: string): string {
  const destClean = destination?.trim().toLowerCase();
  const relevantScams = MOOJYATRA_VERIFIED_DATA.knownScams.filter(s => 
    !destClean || s.cities.some(c => c.toLowerCase().includes(destClean) || destClean.includes(c.toLowerCase()))
  );

  return `
[MOOJYATRA REAL-WORLD TRAVEL TRUTH (MANDATORY)]:
1. PRICE TRUTH:
   - Street food/Chai: ₹10 - ₹40. 
   - Local thali meal: ₹80 - ₹180.
   - Auto-rickshaw: ₹30-50 base fare, ₹11-15 per km.
   - Metro/Local train: ₹10 - ₹60.
   - Budget backpacker daily target: ₹800 - ₹1,500 / day.
   - Mid-range daily target: ₹2,500 - ₹5,000 / day.
2. KNOWN SCAM PATTERNS TO WARN AGAINST (IF RELEVANT):
${relevantScams.map(s => `   - ${s.name}: ${s.tactic} -> Defense: ${s.prevention}`).join("\n")}
3. EMERGENCY CONTACTS:
   - All-India Emergency: ${MOOJYATRA_VERIFIED_DATA.emergencyHelplines.nationalEmergency}
   - Tourist Helpline: ${MOOJYATRA_VERIFIED_DATA.emergencyHelplines.touristHelpline}
   - Women Safety Helpline: ${MOOJYATRA_VERIFIED_DATA.emergencyHelplines.womenHelpline}
4. STRICT TRUTH RULES:
   - Clearly label all prices as realistic estimates (₹).
   - Never fabricate opening hours, specific train schedules, or exact hotel room prices.
   - Recommend authorized prepaid booths, official ASI ticket portals, and licensed guides.
`;
}
