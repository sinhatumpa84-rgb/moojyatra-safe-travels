import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CURRENCIES = [
  { code: "USD", flag: "🇺🇸" }, { code: "EUR", flag: "🇪🇺" }, { code: "GBP", flag: "🇬🇧" },
  { code: "AUD", flag: "🇦🇺" }, { code: "CAD", flag: "🇨🇦" }, { code: "JPY", flag: "🇯🇵" },
  { code: "SGD", flag: "🇸🇬" }, { code: "AED", flag: "🇦🇪" }, { code: "CHF", flag: "🇨🇭" },
  { code: "CNY", flag: "🇨🇳" }, { code: "RUB", flag: "🇷🇺" }, { code: "ZAR", flag: "🇿🇦" },
];

export default function CurrencyTiles({ amount = 1 }: { amount?: number }) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // exchangerate.host free, no key
    fetch(`https://api.exchangerate.host/latest?base=INR&symbols=${CURRENCIES.map(c => c.code).join(",")}`)
      .then(r => r.json())
      .then(d => {
        // We want how many INR per 1 unit of foreign currency → invert
        const inv: Record<string, number> = {};
        Object.entries(d.rates || {}).forEach(([k, v]) => { inv[k] = 1 / (v as number); });
        setRates(inv);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {CURRENCIES.map((c, i) => (
        <motion.div
          key={c.code}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="glass p-4 text-center hover:bg-white/15 transition"
        >
          <div className="text-2xl mb-1">{c.flag}</div>
          <div className="text-xs text-muted-foreground">1 {c.code} =</div>
          <div className="text-lg font-bold gradient-text">
            {loading ? "…" : rates[c.code] ? `₹${(rates[c.code] * amount).toFixed(2)}` : "—"}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
