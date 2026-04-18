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
  const [updated, setUpdated] = useState<string>("");

  useEffect(() => {
    // open.er-api.com — free, no key, CORS-enabled. Base USD, then we compute per currency → INR.
    fetch("https://open.er-api.com/v6/latest/INR")
      .then((r) => r.json())
      .then((d) => {
        if (d?.rates) {
          // d.rates[X] = how many X per 1 INR. We want INR per 1 X → invert.
          const inv: Record<string, number> = {};
          CURRENCIES.forEach((c) => {
            const v = d.rates[c.code];
            if (v) inv[c.code] = 1 / v;
          });
          setRates(inv);
          setUpdated(d.time_last_update_utc || new Date().toUTCString());
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
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
      {updated && (
        <div className="text-[10px] text-muted-foreground text-right mt-2">
          Updated: {new Date(updated).toLocaleString()}
        </div>
      )}
    </div>
  );
}
