const fs = require("fs");
const path = require("path");

// 28 Indian States with 4-5 cities each (total 120+ cities)
const STATES_AND_CITIES = [
  {
    state: "Andhra Pradesh",
    cities: [
      { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, type: "tourist" },
      { name: "Vijayawada", lat: 16.5062, lng: 80.6480, type: "standard" },
      { name: "Tirupati", lat: 13.6288, lng: 79.4192, type: "tourist" },
      { name: "Guntur", lat: 16.3067, lng: 80.4365, type: "standard" },
      { name: "Nellore", lat: 14.4426, lng: 79.9865, type: "standard" }
    ]
  },
  {
    state: "Arunachal Pradesh",
    cities: [
      { name: "Itanagar", lat: 27.0844, lng: 93.6053, type: "standard" },
      { name: "Tawang", lat: 27.5862, lng: 91.8594, type: "tourist" },
      { name: "Ziro", lat: 27.5931, lng: 93.8385, type: "tourist" },
      { name: "Pasighat", lat: 28.0619, lng: 95.3262, type: "standard" }
    ]
  },
  {
    state: "Assam",
    cities: [
      { name: "Guwahati", lat: 26.1445, lng: 91.7362, type: "standard" },
      { name: "Dibrugarh", lat: 27.4728, lng: 94.9120, type: "standard" },
      { name: "Silchar", lat: 24.8333, lng: 92.7789, type: "standard" },
      { name: "Jorhat", lat: 26.7509, lng: 94.2037, type: "standard" },
      { name: "Tezpur", lat: 26.6338, lng: 92.7926, type: "tourist" }
    ]
  },
  {
    state: "Bihar",
    cities: [
      { name: "Patna", lat: 25.5941, lng: 85.1376, type: "standard" },
      { name: "Gaya", lat: 24.7914, lng: 84.9997, type: "tourist" },
      { name: "Bhagalpur", lat: 25.2425, lng: 87.0145, type: "standard" },
      { name: "Muzaffarpur", lat: 26.1226, lng: 85.3906, type: "standard" },
      { name: "Nalanda", lat: 25.1325, lng: 85.4542, type: "tourist" }
    ]
  },
  {
    state: "Chhattisgarh",
    cities: [
      { name: "Raipur", lat: 21.2514, lng: 81.6296, type: "standard" },
      { name: "Bilaspur", lat: 22.0790, lng: 82.1399, type: "standard" },
      { name: "Bhilai", lat: 21.1938, lng: 81.3509, type: "standard" },
      { name: "Jagdalpur", lat: 19.0730, lng: 82.0253, type: "tourist" }
    ]
  },
  {
    state: "Goa",
    cities: [
      { name: "Panaji", lat: 15.4909, lng: 73.8278, type: "tourist" },
      { name: "Margao", lat: 15.2736, lng: 73.9582, type: "tourist" },
      { name: "Vasco da Gama", lat: 15.3959, lng: 73.8143, type: "tourist" },
      { name: "Calangute", lat: 15.5446, lng: 73.7548, type: "tourist" },
      { name: "Mapusa", lat: 15.5937, lng: 73.8143, type: "tourist" }
    ]
  },
  {
    state: "Gujarat",
    cities: [
      { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, type: "standard" },
      { name: "Surat", lat: 21.1702, lng: 72.8311, type: "standard" },
      { name: "Vadodara", lat: 22.3072, lng: 73.1812, type: "standard" },
      { name: "Rajkot", lat: 22.3039, lng: 70.8022, type: "standard" },
      { name: "Dwarka", lat: 22.2442, lng: 68.9685, type: "tourist" }
    ]
  },
  {
    state: "Haryana",
    cities: [
      { name: "Gurugram", lat: 28.4595, lng: 77.0266, type: "metro" },
      { name: "Faridabad", lat: 28.4089, lng: 77.3178, type: "standard" },
      { name: "Panipat", lat: 29.3909, lng: 76.9635, type: "standard" },
      { name: "Ambala", lat: 30.3782, lng: 76.7767, type: "standard" },
      { name: "Kurukshetra", lat: 29.9695, lng: 76.8783, type: "tourist" }
    ]
  },
  {
    state: "Himachal Pradesh",
    cities: [
      { name: "Shimla", lat: 31.1048, lng: 77.1734, type: "tourist" },
      { name: "Manali", lat: 32.2396, lng: 77.1887, type: "tourist" },
      { name: "Dharamshala", lat: 32.2190, lng: 76.3234, type: "tourist" },
      { name: "Dalhousie", lat: 32.5387, lng: 75.9710, type: "tourist" },
      { name: "Kasauli", lat: 30.9013, lng: 76.9649, type: "tourist" }
    ]
  },
  {
    state: "Jharkhand",
    cities: [
      { name: "Ranchi", lat: 23.3441, lng: 85.3096, type: "standard" },
      { name: "Jamshedpur", lat: 22.8046, lng: 86.2029, type: "standard" },
      { name: "Dhanbad", lat: 23.7957, lng: 86.4304, type: "standard" },
      { name: "Deoghar", lat: 24.4820, lng: 86.7003, type: "tourist" }
    ]
  },
  {
    state: "Karnataka",
    cities: [
      { name: "Bengaluru", lat: 12.9716, lng: 77.5946, type: "metro" },
      { name: "Mysuru", lat: 12.2958, lng: 76.6394, type: "tourist" },
      { name: "Mangaluru", lat: 12.9141, lng: 74.8560, type: "standard" },
      { name: "Hampi", lat: 15.3350, lng: 76.4600, type: "tourist" },
      { name: "Gokarna", lat: 14.5479, lng: 74.3188, type: "tourist" }
    ]
  },
  {
    state: "Kerala",
    cities: [
      { name: "Kochi", lat: 9.9312, lng: 76.2673, type: "tourist" },
      { name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, type: "standard" },
      { name: "Munnar", lat: 10.0889, lng: 77.0595, type: "tourist" },
      { name: "Alappuzha", lat: 9.4981, lng: 76.3388, type: "tourist" },
      { name: "Wayanad", lat: 11.6854, lng: 76.1320, type: "tourist" }
    ]
  },
  {
    state: "Madhya Pradesh",
    cities: [
      { name: "Bhopal", lat: 23.2599, lng: 77.4126, type: "standard" },
      { name: "Indore", lat: 22.7196, lng: 75.8577, type: "standard" },
      { name: "Gwalior", lat: 26.2183, lng: 78.1828, type: "standard" },
      { name: "Khajuraho", lat: 24.8318, lng: 79.9199, type: "tourist" },
      { name: "Ujjain", lat: 23.1760, lng: 75.7885, type: "tourist" }
    ]
  },
  {
    state: "Maharashtra",
    cities: [
      { name: "Mumbai", lat: 19.0760, lng: 72.8777, type: "metro" },
      { name: "Pune", lat: 18.5204, lng: 73.8567, type: "metro" },
      { name: "Nagpur", lat: 21.1458, lng: 79.0882, type: "standard" },
      { name: "Lonavala", lat: 18.7557, lng: 73.4091, type: "tourist" },
      { name: "Aurangabad", lat: 19.8762, lng: 75.3433, type: "tourist" }
    ]
  },
  {
    state: "Manipur",
    cities: [
      { name: "Imphal", lat: 24.8170, lng: 93.9368, type: "standard" },
      { name: "Ukhrul", lat: 25.1161, lng: 94.3725, type: "tourist" },
      { name: "Churachandpur", lat: 24.3418, lng: 93.6842, type: "standard" },
      { name: "Loktak Lake", lat: 24.5200, lng: 93.8100, type: "tourist" }
    ]
  },
  {
    state: "Meghalaya",
    cities: [
      { name: "Shillong", lat: 25.5788, lng: 91.8831, type: "tourist" },
      { name: "Cherrapunji", lat: 25.2702, lng: 91.7323, type: "tourist" },
      { name: "Tura", lat: 25.5138, lng: 90.2201, type: "standard" },
      { name: "Mawlynnong", lat: 25.2016, lng: 91.9163, type: "tourist" }
    ]
  },
  {
    state: "Mizoram",
    cities: [
      { name: "Aizawl", lat: 23.7271, lng: 92.7176, type: "standard" },
      { name: "Lunglei", lat: 22.8854, lng: 92.7362, type: "standard" },
      { name: "Champhai", lat: 23.4550, lng: 93.3276, type: "tourist" }
    ]
  },
  {
    state: "Nagaland",
    cities: [
      { name: "Kohima", lat: 25.6751, lng: 94.1086, type: "tourist" },
      { name: "Dimapur", lat: 25.9080, lng: 93.7272, type: "standard" },
      { name: "Mokokchung", lat: 26.3262, lng: 94.5162, type: "tourist" },
      { name: "Dzükou Valley", lat: 25.6100, lng: 94.0600, type: "tourist" }
    ]
  },
  {
    state: "Odisha",
    cities: [
      { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245, type: "standard" },
      { name: "Puri", lat: 19.8135, lng: 85.8312, type: "tourist" },
      { name: "Konark", lat: 19.8876, lng: 86.0945, type: "tourist" },
      { name: "Cuttack", lat: 20.4625, lng: 85.8828, type: "standard" }
    ]
  },
  {
    state: "Punjab",
    cities: [
      { name: "Amritsar", lat: 31.6340, lng: 74.8723, type: "tourist" },
      { name: "Ludhiana", lat: 30.9010, lng: 75.8573, type: "standard" },
      { name: "Jalandhar", lat: 31.3260, lng: 75.5762, type: "standard" },
      { name: "Patiala", lat: 30.3398, lng: 76.3869, type: "standard" }
    ]
  },
  {
    state: "Rajasthan",
    cities: [
      { name: "Jaipur", lat: 26.9124, lng: 75.7873, type: "tourist" },
      { name: "Udaipur", lat: 24.5854, lng: 73.7125, type: "tourist" },
      { name: "Jodhpur", lat: 26.2389, lng: 73.0243, type: "tourist" },
      { name: "Jaisalmer", lat: 26.9157, lng: 70.9083, type: "tourist" },
      { name: "Pushkar", lat: 26.4892, lng: 74.5522, type: "tourist" }
    ]
  },
  {
    state: "Sikkim",
    cities: [
      { name: "Gangtok", lat: 27.3314, lng: 88.6138, type: "tourist" },
      { name: "Namchi", lat: 27.1682, lng: 88.3582, type: "tourist" },
      { name: "Pelling", lat: 27.2917, lng: 88.2323, type: "tourist" },
      { name: "Lachung", lat: 27.6891, lng: 88.7430, type: "tourist" }
    ]
  },
  {
    state: "Tamil Nadu",
    cities: [
      { name: "Chennai", lat: 13.0827, lng: 80.2707, type: "metro" },
      { name: "Madurai", lat: 9.9252, lng: 78.1198, type: "tourist" },
      { name: "Ooty", lat: 11.4102, lng: 76.6950, type: "tourist" },
      { name: "Coimbatore", lat: 11.0168, lng: 76.9558, type: "standard" },
      { name: "Kanyakumari", lat: 8.0883, lng: 77.5385, type: "tourist" }
    ]
  },
  {
    state: "Telangana",
    cities: [
      { name: "Hyderabad", lat: 17.3850, lng: 78.4867, type: "metro" },
      { name: "Warangal", lat: 17.9689, lng: 79.5941, type: "standard" },
      { name: "Nizamabad", lat: 18.6725, lng: 78.0941, type: "standard" },
      { name: "Khammam", lat: 17.2473, lng: 80.1514, type: "standard" }
    ]
  },
  {
    state: "Tripura",
    cities: [
      { name: "Agartala", lat: 23.8315, lng: 91.2868, type: "standard" },
      { name: "Dharmanagar", lat: 24.3683, lng: 92.1648, type: "standard" },
      { name: "Udaipur-Tripura", lat: 23.5332, lng: 91.4816, type: "tourist" }
    ]
  },
  {
    state: "Uttar Pradesh",
    cities: [
      { name: "Varanasi", lat: 25.3176, lng: 82.9739, type: "tourist" },
      { name: "Agra", lat: 27.1767, lng: 78.0081, type: "tourist" },
      { name: "Lucknow", lat: 26.8467, lng: 80.9462, type: "standard" },
      { name: "Mathura", lat: 27.4924, lng: 77.6737, type: "tourist" },
      { name: "Noida", lat: 28.5355, lng: 77.3910, type: "metro" }
    ]
  },
  {
    state: "Uttarakhand",
    cities: [
      { name: "Rishikesh", lat: 30.0869, lng: 78.2676, type: "tourist" },
      { name: "Dehradun", lat: 30.3165, lng: 78.0322, type: "standard" },
      { name: "Haridwar", lat: 29.9457, lng: 78.1642, type: "tourist" },
      { name: "Nainital", lat: 29.3803, lng: 79.4636, type: "tourist" },
      { name: "Mussoorie", lat: 30.4599, lng: 78.0664, type: "tourist" }
    ]
  },
  {
    state: "West Bengal",
    cities: [
      { name: "Kolkata", lat: 22.5726, lng: 88.3639, type: "metro" },
      { name: "Darjeeling", lat: 27.0410, lng: 88.2627, type: "tourist" },
      { name: "Siliguri", lat: 26.7271, lng: 88.3953, type: "standard" },
      { name: "Sundarbans", lat: 22.0500, lng: 88.9000, type: "tourist" }
    ]
  }
];

// All 15 categories with items and pricing rules
const CATEGORY_ITEMS = {
  "Food": [
    { name: "Standard Meals/Thali", baseMin: 80, baseMax: 180, official: false },
    { name: "Local Signature Dish", baseMin: 100, baseMax: 250, official: false },
    { name: "Breakfast Plate (Dosa/Puri/Poha)", baseMin: 40, baseMax: 90, official: false },
    { name: "Evening Snack Plate", baseMin: 30, baseMax: 70, official: false }
  ],
  "Taxi": [
    { name: "Airport Transfer (One-way)", baseMin: 400, baseMax: 900, official: true },
    { name: "Railway Station Pick-up", baseMin: 200, baseMax: 450, official: true },
    { name: "Sightseeing Taxi (8 Hours / 80km)", baseMin: 1800, baseMax: 2800, official: true }
  ],
  "Auto": [
    { name: "Short Auto Ride (Under 3km)", baseMin: 40, baseMax: 70, official: true },
    { name: "Medium Auto Ride (5km)", baseMin: 70, baseMax: 130, official: true },
    { name: "Auto Ride (10km)", baseMin: 130, baseMax: 220, official: true }
  ],
  "Bus": [
    { name: "Local Bus Ticket (Short distance)", baseMin: 10, baseMax: 25, official: true },
    { name: "Local Bus Ticket (Long distance)", baseMin: 25, baseMax: 60, official: true },
    { name: "AC Volvo Intercity Bus (100km)", baseMin: 250, baseMax: 500, official: true }
  ],
  "Train": [
    { name: "Coolie/Porter Service (1 Luggage)", baseMin: 80, baseMax: 150, official: true },
    { name: "Station Cloak Room Storage (24 Hours)", baseMin: 20, baseMax: 40, official: true },
    { name: "Platform Entry Ticket", baseMin: 10, baseMax: 10, official: true }
  ],
  "Hotels": [
    { name: "Budget Guest House Room (Per Night)", baseMin: 500, baseMax: 1200, official: false },
    { name: "3-Star Midscale Hotel Room (Per Night)", baseMin: 1500, baseMax: 3500, official: false },
    { name: "Luxury / Heritage Resort Room (Per Night)", baseMin: 5000, baseMax: 12000, official: false }
  ],
  "Souvenirs": [
    { name: "Local Textile / Shawl", baseMin: 250, baseMax: 1200, official: false },
    { name: "Handcrafted Wooden / Clay Mug", baseMin: 80, baseMax: 250, official: false },
    { name: "Brass / Metal Art Piece", baseMin: 350, baseMax: 1500, official: false },
    { name: "Local Spices / Tea Pack (250g)", baseMin: 100, baseMax: 300, official: false }
  ],
  "Attractions": [
    { name: "Historical Monument Entry (Indian Citizen)", baseMin: 20, baseMax: 50, official: true },
    { name: "Historical Monument Entry (Foreigner)", baseMin: 300, baseMax: 600, official: true },
    { name: "Museum Entry Ticket", baseMin: 10, baseMax: 100, official: true },
    { name: "Palace / Fort Entry Ticket", baseMin: 50, baseMax: 200, official: true }
  ],
  "Boat Rides": [
    { name: "Shared Boat Ride (30 Mins)", baseMin: 50, baseMax: 150, official: true },
    { name: "Private Chartered Boat Ride (1 Hour)", baseMin: 400, baseMax: 1500, official: false }
  ],
  "Parking": [
    { name: "Two-Wheeler Parking (Per Hour)", baseMin: 10, baseMax: 20, official: true },
    { name: "Four-Wheeler Parking (Per Hour)", baseMin: 20, baseMax: 50, official: true },
    { name: "Tourist Spot All-Day Parking (Car)", baseMin: 50, baseMax: 100, official: true }
  ],
  "Cafés": [
    { name: "Traditional Filter Coffee / Tea", baseMin: 15, baseMax: 40, official: false },
    { name: "Cappuccino / Latte", baseMin: 90, baseMax: 180, official: false },
    { name: "Grilled Sandwich", baseMin: 60, baseMax: 150, official: false }
  ],
  "Street Food": [
    { name: "Pani Puri / Golgappa (6 Pcs)", baseMin: 20, baseMax: 40, official: false },
    { name: "Samosa / Vada Pav (Plate)", baseMin: 15, baseMax: 30, official: false },
    { name: "Pav Bhaji / Chaat (Plate)", baseMin: 40, baseMax: 90, official: false },
    { name: "Fresh Fruit Juice / Soda", baseMin: 20, baseMax: 50, official: false }
  ],
  "Public Facilities": [
    { name: "Paid Public Restroom (Toilet)", baseMin: 2, baseMax: 5, official: true },
    { name: "Paid Public Restroom (Bathroom)", baseMin: 10, baseMax: 15, official: true },
    { name: "Purified Drinking Water Refill (20L)", baseMin: 10, baseMax: 20, official: true }
  ],
  "Cultural Activities": [
    { name: "Folk Dance / Puppet Show Ticket", baseMin: 100, baseMax: 300, official: true },
    { name: "Sound and Light Show Ticket", baseMin: 50, baseMax: 150, official: true }
  ],
  "Rentals": [
    { name: "Bicycle Rental (Per Day)", baseMin: 50, baseMax: 100, official: false },
    { name: "Scooter / Activa Rental (Per Day)", baseMin: 350, baseMax: 600, official: false },
    { name: "Royal Enfield / Cruiser Rental (Per Day)", baseMin: 900, baseMax: 1500, official: false }
  ]
};

// Main generator logic
function generateData() {
  const records = [];
  let recordCounter = 1;
  let cityCounter = 1;

  const citiesFlat = [];

  for (const stateObj of STATES_AND_CITIES) {
    for (const cityObj of stateObj.cities) {
      const cityId = `c-${cityCounter++}`;
      citiesFlat.push({
        id: cityId,
        state: stateObj.state,
        name: cityObj.name,
        lat: cityObj.lat,
        lng: cityObj.lng,
        type: cityObj.type
      });

      // Pricing multipliers based on city type
      let multiplier = 1.0;
      let scamRisk = 1.0; // multiplier for tourist markup

      if (cityObj.type === "metro") {
        multiplier = 1.35;
        scamRisk = 1.2;
      } else if (cityObj.type === "tourist") {
        multiplier = 1.15;
        scamRisk = 1.6; // High tourist markups!
      } else {
        multiplier = 0.9;
        scamRisk = 0.85;
      }

      // Generate items for ALL 15 categories for each city!
      for (const [category, items] of Object.entries(CATEGORY_ITEMS)) {
        for (const itemTemplate of items) {
          const id = `p-${recordCounter++}`;
          
          // Compute prices
          const rawBasePrice = Math.floor(
            (Math.random() * (itemTemplate.baseMax - itemTemplate.baseMin) + itemTemplate.baseMin) * multiplier
          );
          
          // Round prices to clean numbers
          const roundTo = rawBasePrice > 1000 ? 100 : (rawBasePrice > 100 ? 10 : 5);
          const localPrice = Math.max(
            rawBasePrice > 5 ? 5 : 2, 
            Math.round(rawBasePrice / roundTo) * roundTo
          );

          // Tourist markup / Scam Premium
          // Taxis, Lodging, Boat rides, and Souvenirs have higher premiums
          let markupBase = 0.2; // default +20%
          if (["Taxi", "Souvenirs", "Rentals", "Boat Rides"].includes(category)) {
            markupBase = 0.8 + Math.random() * 0.9; // +80% to +170%
          } else if (["Food", "Cafés", "Street Food", "Hotels"].includes(category)) {
            markupBase = 0.3 + Math.random() * 0.5; // +30% to +80%
          } else if (["Attractions"].includes(category)) {
            // attractions tickets (Foreigner vs Local) is fixed in template
            if (itemTemplate.name.includes("Foreigner")) {
              markupBase = 0.05; // foreigner price itself is already high
            } else {
              markupBase = 0.5 + Math.random() * 1.5; // foreigners buying local tickets etc
            }
          } else if (["Bus", "Train", "Public Facilities", "Parking"].includes(category)) {
            markupBase = 0.05 + Math.random() * 0.25; // low scam markup
          }

          const scamPremiumPercent = markupBase * scamRisk;
          const touristPrice = Math.round((localPrice * (1 + scamPremiumPercent)) / 5) * 5;

          // Official price (some things have official prices, some don't)
          let officialPrice = null;
          if (itemTemplate.official) {
            // official is usually close to local price, sometimes exactly local price
            const variation = (Math.random() * 0.1) - 0.05; // -5% to +5%
            officialPrice = Math.max(localPrice, Math.round((localPrice * (1 + variation)) / 5) * 5);
          }

          // Trust score and report counts
          // High scam risk implies lower trust score and higher reports
          const baseTrust = 95 - (scamPremiumPercent * 15);
          const trustScore = Math.max(50, Math.min(99, Math.floor(baseTrust + (Math.random() * 8 - 4))));
          const reports = Math.floor((Math.random() * 35 + 5) * (1 + scamPremiumPercent));

          // Last updated within the last 60 days
          const daysAgo = Math.floor(Math.random() * 60);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          const lastUpdated = date.toISOString().split("T")[0];

          records.push({
            id,
            city_id: cityId,
            state: stateObj.state,
            city: cityObj.name,
            category,
            item: itemTemplate.name,
            localPrice,
            touristPrice,
            officialPrice,
            currency: "INR",
            trustScore,
            reports,
            lastUpdated
          });
        }
      }
    }
  }

  return { cities: citiesFlat, prices: records };
}

// Write the files
function main() {
  console.log("Generating seed database...");
  const data = generateData();
  const csvDir = path.join(__dirname, "..", "csv");
  
  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
  }

  // 1. Generate JSON file
  const jsonPath = path.join(csvDir, "seed_price_truth.json");
  fs.writeFileSync(jsonPath, JSON.stringify(data.prices, null, 2), "utf-8");
  console.log(`✓ JSON file written to ${jsonPath} (${data.prices.length} records)`);

  // 2. Generate CSV file
  const csvPath = path.join(csvDir, "seed_price_truth.csv");
  const csvHeaders = "state,city,category,item,localPrice,touristPrice,officialPrice,currency,trustScore,reports,lastUpdated\n";
  const csvRows = data.prices.map(p => {
    // Escape values that might contain commas
    const escapedItem = p.item.includes(",") ? `"${p.item}"` : p.item;
    const offPrice = p.officialPrice === null ? "" : p.officialPrice;
    return `${p.state},${p.city},${p.category},${escapedItem},${p.localPrice},${p.touristPrice},${offPrice},${p.currency},${p.trustScore},${p.reports},${p.lastUpdated}`;
  }).join("\n");
  
  fs.writeFileSync(csvPath, csvHeaders + csvRows, "utf-8");
  console.log(`✓ CSV file written to ${csvPath}`);

  // 3. Generate MongoDB Import file (JSON lines format)
  const mongoPath = path.join(csvDir, "mongodb_import.json");
  const mongoRows = data.prices.map(p => JSON.stringify(p)).join("\n");
  fs.writeFileSync(mongoPath, mongoRows, "utf-8");
  console.log(`✓ MongoDB import file written to ${mongoPath}`);

  // 4. Generate Supabase SQL seed file
  const sqlPath = path.join(csvDir, "supabase_seed.sql");
  let sqlContent = `-- Supabase Price Truth Seed File\n`;
  sqlContent += `-- Created on ${new Date().toISOString()}\n\n`;
  
  // Insert statements for cities
  sqlContent += `-- Seed Cities\n`;
  sqlContent += `INSERT INTO cities (id, name, state, lat, lng) VALUES\n`;
  const cityInserts = data.cities.map(c => 
    `('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.state.replace(/'/g, "''")}', ${c.lat}, ${c.lng})`
  ).join(",\n") + ";\n\n";
  sqlContent += cityInserts;

  // Insert statements for prices (grouped in batches of 500 to avoid query size limits)
  sqlContent += `-- Seed Prices\n`;
  const batchSize = 400;
  for (let i = 0; i < data.prices.length; i += batchSize) {
    const batch = data.prices.slice(i, i + batchSize);
    sqlContent += `INSERT INTO prices (id, city_id, category, item, local_price, tourist_price, official_price, trust_score, report_count, currency) VALUES\n`;
    sqlContent += batch.map(p => {
      const offVal = p.officialPrice === null ? "NULL" : p.officialPrice;
      const itemNameEsc = p.item.replace(/'/g, "''");
      const catEsc = p.category.toLowerCase().replace(/'/g, "''");
      return `('${p.id}', '${p.city_id}', '${catEsc}', '${itemNameEsc}', ${p.localPrice}, ${p.touristPrice}, ${offVal}, ${p.trustScore}, ${p.reports}, '${p.currency}')`;
    }).join(",\n") + ";\n\n";
  }

  fs.writeFileSync(sqlPath, sqlContent, "utf-8");
  console.log(`✓ Supabase SQL seed file written to ${sqlPath}`);
  console.log(`\nSuccess! Total generated records: ${data.prices.length} items across ${data.cities.length} cities.`);
}

main();
