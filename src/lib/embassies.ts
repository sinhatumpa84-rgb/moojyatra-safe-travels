// 50+ embassy / consulate emergency contacts in India
// Sources: official embassy websites (Delhi-based unless noted)
export type Embassy = {
  country: string;
  flag: string;
  emergency: string;     // 24/7 emergency line
  general?: string;      // general switchboard
  city?: string;
  website?: string;
};

export const EMBASSIES: Embassy[] = [
  { country: "United States", flag: "🇺🇸", emergency: "+91-11-2419-8000", general: "+91-11-2419-8000", city: "New Delhi", website: "https://in.usembassy.gov" },
  { country: "United Kingdom", flag: "🇬🇧", emergency: "+91-11-2419-2100", city: "New Delhi", website: "https://www.gov.uk/world/india" },
  { country: "Canada", flag: "🇨🇦", emergency: "+91-11-4178-2000", city: "New Delhi", website: "https://www.canadainternational.gc.ca/india-inde" },
  { country: "Australia", flag: "🇦🇺", emergency: "+91-11-4139-9900", city: "New Delhi", website: "https://india.embassy.gov.au" },
  { country: "Germany", flag: "🇩🇪", emergency: "+91-11-4419-9199", city: "New Delhi", website: "https://india.diplo.de" },
  { country: "France", flag: "🇫🇷", emergency: "+91-11-4319-6100", city: "New Delhi", website: "https://in.ambafrance.org" },
  { country: "Japan", flag: "🇯🇵", emergency: "+91-11-4610-4610", city: "New Delhi", website: "https://www.in.emb-japan.go.jp" },
  { country: "China", flag: "🇨🇳", emergency: "+91-11-2611-2345", city: "New Delhi", website: "http://in.china-embassy.gov.cn" },
  { country: "Russia", flag: "🇷🇺", emergency: "+91-11-2611-0560", city: "New Delhi", website: "https://india.mid.ru" },
  { country: "Italy", flag: "🇮🇹", emergency: "+91-11-2611-4355", city: "New Delhi", website: "https://ambnewdelhi.esteri.it" },
  { country: "Spain", flag: "🇪🇸", emergency: "+91-11-4129-3000", city: "New Delhi", website: "http://www.exteriores.gob.es" },
  { country: "Netherlands", flag: "🇳🇱", emergency: "+91-11-2419-7600", city: "New Delhi", website: "https://www.netherlandsworldwide.nl/countries/india" },
  { country: "Switzerland", flag: "🇨🇭", emergency: "+91-11-4995-9500", city: "New Delhi", website: "https://www.eda.admin.ch/newdelhi" },
  { country: "Sweden", flag: "🇸🇪", emergency: "+91-11-4419-7100", city: "New Delhi", website: "https://www.swedenabroad.se/newdelhi" },
  { country: "Norway", flag: "🇳🇴", emergency: "+91-11-4177-9200", city: "New Delhi", website: "https://www.norway.no/en/india" },
  { country: "Denmark", flag: "🇩🇰", emergency: "+91-11-4209-0700", city: "New Delhi", website: "https://indien.um.dk" },
  { country: "Finland", flag: "🇫🇮", emergency: "+91-11-4149-7500", city: "New Delhi", website: "https://finlandabroad.fi/india" },
  { country: "Belgium", flag: "🇧🇪", emergency: "+91-11-4242-8000", city: "New Delhi", website: "https://india.diplomatie.belgium.be" },
  { country: "Ireland", flag: "🇮🇪", emergency: "+91-11-4940-3200", city: "New Delhi", website: "https://www.ireland.ie/en/india" },
  { country: "Portugal", flag: "🇵🇹", emergency: "+91-11-4607-1001", city: "New Delhi" },
  { country: "Austria", flag: "🇦🇹", emergency: "+91-11-2419-2700", city: "New Delhi", website: "https://www.bmeia.gv.at/en/embassy/new-delhi" },
  { country: "Greece", flag: "🇬🇷", emergency: "+91-11-2688-0700", city: "New Delhi" },
  { country: "Poland", flag: "🇵🇱", emergency: "+91-11-4149-6900", city: "New Delhi", website: "https://www.gov.pl/web/india" },
  { country: "Czech Republic", flag: "🇨🇿", emergency: "+91-11-2415-5200", city: "New Delhi" },
  { country: "Hungary", flag: "🇭🇺", emergency: "+91-11-2611-4737", city: "New Delhi" },
  { country: "Turkey", flag: "🇹🇷", emergency: "+91-11-2688-9053", city: "New Delhi" },
  { country: "Israel", flag: "🇮🇱", emergency: "+91-11-3041-4500", city: "New Delhi", website: "https://embassies.gov.il/delhi" },
  { country: "United Arab Emirates", flag: "🇦🇪", emergency: "+91-11-2687-2937", city: "New Delhi" },
  { country: "Saudi Arabia", flag: "🇸🇦", emergency: "+91-11-2614-0212", city: "New Delhi" },
  { country: "Qatar", flag: "🇶🇦", emergency: "+91-11-2611-1986", city: "New Delhi" },
  { country: "Egypt", flag: "🇪🇬", emergency: "+91-11-2611-4096", city: "New Delhi" },
  { country: "South Africa", flag: "🇿🇦", emergency: "+91-11-2614-9411", city: "New Delhi" },
  { country: "Kenya", flag: "🇰🇪", emergency: "+91-11-2614-6537", city: "New Delhi" },
  { country: "Nigeria", flag: "🇳🇬", emergency: "+91-11-2412-2142", city: "New Delhi" },
  { country: "Brazil", flag: "🇧🇷", emergency: "+91-11-4949-9999", city: "New Delhi" },
  { country: "Argentina", flag: "🇦🇷", emergency: "+91-11-2688-9417", city: "New Delhi" },
  { country: "Mexico", flag: "🇲🇽", emergency: "+91-11-4129-9000", city: "New Delhi" },
  { country: "Chile", flag: "🇨🇱", emergency: "+91-11-2614-7853", city: "New Delhi" },
  { country: "South Korea", flag: "🇰🇷", emergency: "+91-11-4200-7000", city: "New Delhi", website: "https://overseas.mofa.go.kr/in-en" },
  { country: "Singapore", flag: "🇸🇬", emergency: "+91-11-4600-0915", city: "New Delhi" },
  { country: "Malaysia", flag: "🇲🇾", emergency: "+91-11-2415-9300", city: "New Delhi" },
  { country: "Thailand", flag: "🇹🇭", emergency: "+91-11-4977-4100", city: "New Delhi" },
  { country: "Indonesia", flag: "🇮🇩", emergency: "+91-11-2611-8642", city: "New Delhi" },
  { country: "Philippines", flag: "🇵🇭", emergency: "+91-11-2688-9091", city: "New Delhi" },
  { country: "Vietnam", flag: "🇻🇳", emergency: "+91-11-2687-9852", city: "New Delhi" },
  { country: "Bangladesh", flag: "🇧🇩", emergency: "+91-11-2412-1389", city: "New Delhi" },
  { country: "Sri Lanka", flag: "🇱🇰", emergency: "+91-11-2301-0201", city: "New Delhi" },
  { country: "Nepal", flag: "🇳🇵", emergency: "+91-11-2332-9218", city: "New Delhi" },
  { country: "Bhutan", flag: "🇧🇹", emergency: "+91-11-2688-9230", city: "New Delhi" },
  { country: "Myanmar", flag: "🇲🇲", emergency: "+91-11-2467-8822", city: "New Delhi" },
  { country: "Pakistan", flag: "🇵🇰", emergency: "+91-11-2467-6004", city: "New Delhi" },
  { country: "Afghanistan", flag: "🇦🇫", emergency: "+91-11-2410-0412", city: "New Delhi" },
  { country: "Iran", flag: "🇮🇷", emergency: "+91-11-2332-9600", city: "New Delhi" },
  { country: "New Zealand", flag: "🇳🇿", emergency: "+91-11-4688-3170", city: "New Delhi", website: "https://www.mfat.govt.nz/en/countries-and-regions/south-asia/india" },
  { country: "Ukraine", flag: "🇺🇦", emergency: "+91-11-2614-6041", city: "New Delhi" },
  { country: "Romania", flag: "🇷🇴", emergency: "+91-11-2614-0700", city: "New Delhi" },
];
