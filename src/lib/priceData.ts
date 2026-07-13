export type PriceCity = {
  id: string;
  name: string;
  state?: string | null;
  lat: number;
  lng: number;
};

export type PriceRecord = {
  id: string;
  city_id: string;
  category: string;
  item: string;
  local_price: number;
  tourist_price: number;
  official_price: number | null;
  trust_score: number;
  report_count: number;
  currency: string;
  cities?: { name?: string | null } | null;
};

const fallbackCities: PriceCity[] = [
  { id: "city-visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { id: "city-itanagar", name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053 },
  { id: "city-guwahati", name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { id: "city-patna", name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { id: "city-raipur", name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { id: "city-panaji", name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278 },
  { id: "city-ahmedabad", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { id: "city-gurugram", name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { id: "city-shimla", name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { id: "city-ranchi", name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { id: "city-bengaluru", name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { id: "city-kochi", name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { id: "city-bhopal", name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { id: "city-mumbai", name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { id: "city-imphal", name: "Imphal", state: "Manipur", lat: 24.8170, lng: 93.9368 },
  { id: "city-shillong", name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8831 },
  { id: "city-aizawl", name: "Aizawl", state: "Mizoram", lat: 23.7271, lng: 92.7176 },
  { id: "city-kohima", name: "Kohima", state: "Nagaland", lat: 25.6751, lng: 94.1086 },
  { id: "city-bhubaneswar", name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  { id: "city-amritsar", name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723 },
  { id: "city-jaipur", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { id: "city-gangtok", name: "Gangtok", state: "Sikkim", lat: 27.3314, lng: 88.6138 },
  { id: "city-chennai", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { id: "city-hyderabad", name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { id: "city-agartala", name: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868 },
  { id: "city-varanasi", name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { id: "city-rishikesh", name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676 },
  { id: "city-kolkata", name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
];

const fallbackPrices: PriceRecord[] = [
  { id: "price-visakhapatnam", city_id: "city-visakhapatnam", category: "food", item: "Andhra Meals", local_price: 120, tourist_price: 250, official_price: 150, trust_score: 92, report_count: 15, currency: "INR" },
  { id: "price-itanagar", city_id: "city-itanagar", category: "transport", item: "Auto (3 km)", local_price: 80, tourist_price: 180, official_price: 100, trust_score: 88, report_count: 8, currency: "INR" },
  { id: "price-guwahati", city_id: "city-guwahati", category: "food", item: "Assamese Thali", local_price: 150, tourist_price: 320, official_price: 180, trust_score: 91, report_count: 14, currency: "INR" },
  { id: "price-patna", city_id: "city-patna", category: "transport", item: "Auto (5 km)", local_price: 70, tourist_price: 160, official_price: 90, trust_score: 86, report_count: 10, currency: "INR" },
  { id: "price-raipur", city_id: "city-raipur", category: "souvenir", item: "Bamboo Craft", local_price: 300, tourist_price: 650, official_price: 350, trust_score: 89, report_count: 9, currency: "INR" },
  { id: "price-panaji", city_id: "city-panaji", category: "transport", item: "Local Bus Ride", local_price: 20, tourist_price: 45, official_price: 25, trust_score: 84, report_count: 12, currency: "INR" },
  { id: "price-ahmedabad", city_id: "city-ahmedabad", category: "food", item: "Gujarati Thali", local_price: 180, tourist_price: 350, official_price: 220, trust_score: 90, report_count: 18, currency: "INR" },
  { id: "price-gurugram", city_id: "city-gurugram", category: "taxi", item: "Airport Taxi", local_price: 450, tourist_price: 900, official_price: 550, trust_score: 82, report_count: 25, currency: "INR" },
  { id: "price-shimla", city_id: "city-shimla", category: "souvenir", item: "Wool Shawl", local_price: 500, tourist_price: 1200, official_price: 650, trust_score: 91, report_count: 22, currency: "INR" },
  { id: "price-ranchi", city_id: "city-ranchi", category: "food", item: "Litti Chokha", local_price: 80, tourist_price: 180, official_price: 100, trust_score: 89, report_count: 7, currency: "INR" },
  { id: "price-bengaluru", city_id: "city-bengaluru", category: "transport", item: "Auto (5 km)", local_price: 120, tourist_price: 300, official_price: 150, trust_score: 86, report_count: 34, currency: "INR" },
  { id: "price-kochi", city_id: "city-kochi", category: "food", item: "Kerala Sadya", local_price: 180, tourist_price: 420, official_price: 220, trust_score: 92, report_count: 19, currency: "INR" },
  { id: "price-bhopal", city_id: "city-bhopal", category: "souvenir", item: "Tribal Handicraft", local_price: 350, tourist_price: 700, official_price: 450, trust_score: 87, report_count: 11, currency: "INR" },
  { id: "price-mumbai", city_id: "city-mumbai", category: "taxi", item: "Airport Taxi", local_price: 600, tourist_price: 1400, official_price: 750, trust_score: 81, report_count: 42, currency: "INR" },
  { id: "price-imphal", city_id: "city-imphal", category: "food", item: "Manipuri Thali", local_price: 150, tourist_price: 320, official_price: 180, trust_score: 90, report_count: 6, currency: "INR" },
  { id: "price-shillong", city_id: "city-shillong", category: "transport", item: "Shared Taxi", local_price: 60, tourist_price: 150, official_price: 80, trust_score: 91, report_count: 15, currency: "INR" },
  { id: "price-aizawl", city_id: "city-aizawl", category: "food", item: "Mizo Meal", local_price: 180, tourist_price: 400, official_price: 220, trust_score: 89, report_count: 5, currency: "INR" },
  { id: "price-kohima", city_id: "city-kohima", category: "souvenir", item: "Naga Shawl", local_price: 700, tourist_price: 1600, official_price: 900, trust_score: 88, report_count: 8, currency: "INR" },
  { id: "price-bhubaneswar", city_id: "city-bhubaneswar", category: "temple", item: "Shoe Stand", local_price: 10, tourist_price: 50, official_price: 20, trust_score: 83, report_count: 14, currency: "INR" },
  { id: "price-amritsar", city_id: "city-amritsar", category: "food", item: "Amritsari Kulcha", local_price: 70, tourist_price: 180, official_price: 90, trust_score: 90, report_count: 28, currency: "INR" },
  { id: "price-jaipur", city_id: "city-jaipur", category: "souvenir", item: "Blue Pottery Mug", local_price: 180, tourist_price: 420, official_price: 220, trust_score: 88, report_count: 16, currency: "INR" },
  { id: "price-gangtok", city_id: "city-gangtok", category: "transport", item: "Taxi (5 km)", local_price: 180, tourist_price: 450, official_price: 220, trust_score: 90, report_count: 12, currency: "INR" },
  { id: "price-chennai", city_id: "city-chennai", category: "food", item: "South Indian Meals", local_price: 120, tourist_price: 280, official_price: 150, trust_score: 91, report_count: 20, currency: "INR" },
  { id: "price-hyderabad", city_id: "city-hyderabad", category: "food", item: "Hyderabadi Biryani", local_price: 220, tourist_price: 500, official_price: 280, trust_score: 89, report_count: 27, currency: "INR" },
  { id: "price-agartala", city_id: "city-agartala", category: "transport", item: "Auto (5 km)", local_price: 60, tourist_price: 140, official_price: 80, trust_score: 90, report_count: 9, currency: "INR" },
  { id: "price-varanasi", city_id: "city-varanasi", category: "boat ride", item: "Ganga Boat Ride", local_price: 200, tourist_price: 800, official_price: 300, trust_score: 82, report_count: 31, currency: "INR" },
  { id: "price-rishikesh", city_id: "city-rishikesh", category: "adventure", item: "River Rafting", local_price: 700, tourist_price: 1800, official_price: 900, trust_score: 87, report_count: 18, currency: "INR" },
  { id: "price-kolkata", city_id: "city-kolkata", category: "food", item: "Fish Thali", local_price: 180, tourist_price: 380, official_price: 220, trust_score: 90, report_count: 24, currency: "INR" },
];

function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizePriceData(
  citiesInput: Array<Record<string, unknown>> = [],
  pricesInput: Array<Record<string, unknown>> = []
) {
  const cities = citiesInput.length > 0
    ? citiesInput.map((city) => ({
        id: String(city.id ?? ""),
        name: String(city.name ?? "Unknown city"),
        state: typeof city.state === "string" ? city.state : null,
        lat: toNumber(city.lat),
        lng: toNumber(city.lng),
      }))
    : fallbackCities;

  const prices = pricesInput.length > 0
    ? pricesInput.map((price) => {
        const cityId = String(price.city_id ?? "");
        const cityMatch = cities.find((city) => city.id === cityId);
        const cityName =
          (typeof price.cities === "object" && price.cities && "name" in price.cities && typeof (price.cities as { name?: unknown }).name === "string"
            ? (price.cities as { name?: string }).name
            : undefined) ??
          cityMatch?.name ??
          "Unknown city";

        return {
          id: String(price.id ?? ""),
          city_id: cityId,
          category: String(price.category ?? "general"),
          item: String(price.item ?? "Unknown item"),
          local_price: toNumber(price.local_price),
          tourist_price: toNumber(price.tourist_price),
          official_price: price.official_price == null ? null : toNumber(price.official_price),
          trust_score: toNumber(price.trust_score),
          report_count: toNumber(price.report_count),
          currency: String(price.currency ?? "INR"),
          cities: { name: cityName },
        } satisfies PriceRecord;
      })
    : fallbackPrices.map((price) => ({
        ...price,
        cities: { name: cities.find((city) => city.id === price.city_id)?.name ?? "Unknown city" },
      }));

  return { cities, prices };
}

export function getPremiumPercent(price: Pick<PriceRecord, "local_price" | "tourist_price">) {
  const localPrice = price.local_price;
  if (!Number.isFinite(localPrice) || localPrice <= 0) {
    return 0;
  }
  return ((price.tourist_price - localPrice) / localPrice) * 100;
}

export function getPriceFallbackData() {
  return {
    cities: fallbackCities,
    prices: fallbackPrices.map((price) => ({
      ...price,
      cities: { name: fallbackCities.find((city) => city.id === price.city_id)?.name ?? "Unknown city" },
    })),
  };
}
