import type { PriceCity, PriceRecord } from "./priceData";

// ─── CSV parser ──────────────────────────────────────────────────────────────
function parseCSV(raw: string): Array<Record<string, string>> {
  const [headerLine, ...dataLines] = raw.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return dataLines
    .filter((l) => l.trim())
    .map((line) => {
      const cols = line.split(",");
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h.trim()] = (cols[i] ?? "").trim();
      });
      return row;
    });
}

// ─── City name → stable slug id ──────────────────────────────────────────────
function slugify(name: string) {
  return "city-" + name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ─── Hardcoded coords for every city produced by the generator ───────────────
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Andhra Pradesh
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Vijayawada: { lat: 16.5062, lng: 80.648 },
  Tirupati: { lat: 13.6288, lng: 79.4192 },
  // Arunachal Pradesh
  Itanagar: { lat: 27.0844, lng: 93.6053 },
  Tawang: { lat: 27.5861, lng: 91.8594 },
  // Assam
  Guwahati: { lat: 26.1445, lng: 91.7362 },
  Jorhat: { lat: 26.7509, lng: 94.2037 },
  Kaziranga: { lat: 26.5775, lng: 93.17 },
  // Bihar
  Patna: { lat: 25.5941, lng: 85.1376 },
  Gaya: { lat: 24.7955, lng: 85.0002 },
  Bodh_Gaya: { lat: 24.6961, lng: 84.9913 },
  "Bodh Gaya": { lat: 24.6961, lng: 84.9913 },
  // Chhattisgarh
  Raipur: { lat: 21.2514, lng: 81.6296 },
  Jagdalpur: { lat: 19.0728, lng: 82.0178 },
  // Goa
  Panaji: { lat: 15.4909, lng: 73.8278 },
  Calangute: { lat: 15.5438, lng: 73.7553 },
  Margao: { lat: 15.2832, lng: 73.9862 },
  // Gujarat
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Vadodara: { lat: 22.3072, lng: 73.1812 },
  Dwarka: { lat: 22.2393, lng: 68.9678 },
  // Haryana
  Gurugram: { lat: 28.4595, lng: 77.0266 },
  Faridabad: { lat: 28.4089, lng: 77.3178 },
  Kurukshetra: { lat: 29.9695, lng: 76.8783 },
  // Himachal Pradesh
  Shimla: { lat: 31.1048, lng: 77.1734 },
  Manali: { lat: 32.2396, lng: 77.1887 },
  Dharamshala: { lat: 32.2196, lng: 76.3234 },
  // Jharkhand
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Jamshedpur: { lat: 22.8046, lng: 86.2029 },
  // Karnataka
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mysuru: { lat: 12.2958, lng: 76.6394 },
  Hampi: { lat: 15.335, lng: 76.46 },
  Coorg: { lat: 12.3375, lng: 75.8069 },
  // Kerala
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  Munnar: { lat: 10.0889, lng: 77.0595 },
  Alleppey: { lat: 9.4981, lng: 76.3388 },
  // Madhya Pradesh
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Khajuraho: { lat: 24.8318, lng: 79.9199 },
  // Maharashtra
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Nashik: { lat: 20.0059, lng: 73.7910 },
  Aurangabad: { lat: 19.8762, lng: 75.3433 },
  // Manipur
  Imphal: { lat: 24.817, lng: 93.9368 },
  // Meghalaya
  Shillong: { lat: 25.5788, lng: 91.8831 },
  Cherrapunji: { lat: 25.2844, lng: 91.722 },
  // Mizoram
  Aizawl: { lat: 23.7271, lng: 92.7176 },
  // Nagaland
  Kohima: { lat: 25.6751, lng: 94.1086 },
  Dimapur: { lat: 25.9044, lng: 93.7279 },
  // Odisha
  Bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  Puri: { lat: 19.8135, lng: 85.8312 },
  Konark: { lat: 19.8876, lng: 86.0944 },
  // Punjab
  Amritsar: { lat: 31.634, lng: 74.8723 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Ludhiana: { lat: 30.9009, lng: 75.8573 },
  // Rajasthan
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Jodhpur: { lat: 26.2389, lng: 73.0243 },
  Udaipur: { lat: 24.5854, lng: 73.7125 },
  Jaisalmer: { lat: 26.9157, lng: 70.9083 },
  Pushkar: { lat: 26.4897, lng: 74.5511 },
  Ajmer: { lat: 26.4499, lng: 74.6399 },
  // Sikkim
  Gangtok: { lat: 27.3314, lng: 88.6138 },
  // Tamil Nadu
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Ooty: { lat: 11.4102, lng: 76.6950 },
  Rameswaram: { lat: 9.2876, lng: 79.3129 },
  // Telangana
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Warangal: { lat: 17.9784, lng: 79.5941 },
  // Tripura
  Agartala: { lat: 23.8315, lng: 91.2868 },
  // Uttar Pradesh
  Varanasi: { lat: 25.3176, lng: 82.9739 },
  Agra: { lat: 27.1767, lng: 78.0081 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Mathura: { lat: 27.4924, lng: 77.6737 },
  // Uttarakhand
  Rishikesh: { lat: 30.0869, lng: 78.2676 },
  Haridwar: { lat: 29.9457, lng: 78.1642 },
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Nainital: { lat: 29.3919, lng: 79.4542 },
  // West Bengal
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Darjeeling: { lat: 27.041, lng: 88.2663 },
  Siliguri: { lat: 26.7271, lng: 88.3953 },
};

function getCityCoords(cityName: string) {
  return CITY_COORDS[cityName] ?? { lat: 20.5937, lng: 78.9629 }; // India centroid fallback
}

// ─── Public API ──────────────────────────────────────────────────────────────
let _cache: { cities: PriceCity[]; prices: PriceRecord[] } | null = null;
let _loading: Promise<{ cities: PriceCity[]; prices: PriceRecord[] }> | null = null;

export async function loadCSVPriceData(): Promise<{ cities: PriceCity[]; prices: PriceRecord[] }> {
  if (_cache) return _cache;
  if (_loading) return _loading;

  _loading = (async () => {
    const res = await fetch("/seed_price_truth.csv");
    if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
    const raw = await res.text();
    const rows = parseCSV(raw);

    // Build deduplicated city list
    const cityMap = new Map<string, PriceCity>();
    rows.forEach((row) => {
      const name = row.city;
      const id = slugify(name);
      if (!cityMap.has(id)) {
        cityMap.set(id, {
          id,
          name,
          state: row.state || null,
          ...getCityCoords(name),
        });
      }
    });
    const cities = Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    // Convert rows → PriceRecord[]
    const prices: PriceRecord[] = rows.map((row, i) => {
      const cityId = slugify(row.city);
      const cityName = cityMap.get(cityId)?.name ?? row.city;
      const localPrice = parseFloat(row.localPrice) || 0;
      const touristPrice = parseFloat(row.touristPrice) || 0;
      const officialRaw = row.officialPrice?.trim();
      const officialPrice = officialRaw ? parseFloat(officialRaw) : null;
      return {
        id: `csv-${i}`,
        city_id: cityId,
        category: row.category,
        item: row.item,
        local_price: localPrice,
        tourist_price: touristPrice,
        official_price: officialPrice,
        trust_score: parseInt(row.trustScore) || 80,
        report_count: parseInt(row.reports) || 0,
        currency: row.currency || "INR",
        cities: { name: cityName },
      };
    });

    _cache = { cities, prices };
    return _cache;
  })();

  return _loading;
}
