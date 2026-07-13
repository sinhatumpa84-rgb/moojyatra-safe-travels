import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import CurrencyCard from "./CurrencyCard";
import CurrencyConverterModal from "./CurrencyConverterModal";

export interface CurrencyOption {
  code: string;
  flag: string;
  name: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", flag: "🇺🇸", name: "United States Dollar" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar" },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar" },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen" },
  { code: "SGD", flag: "🇸🇬", name: "Singapore Dollar" },
  { code: "AED", flag: "🇦🇪", name: "UAE Dirham" },
  { code: "CHF", flag: "🇨🇭", name: "Swiss Franc" },
  { code: "CNY", flag: "🇨🇳", name: "Chinese Yuan" },
  { code: "RUB", flag: "🇷🇺", name: "Russian Ruble" },
  { code: "ZAR", flag: "🇿🇦", name: "South African Rand" },
];

export default function CurrencyTiles({ amount = 1 }: { amount?: number }) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<string>("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

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

  const openConverter = (code: string) => {
    setSelectedCurrency(code);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {CURRENCIES.map((c, i) => (
          <CurrencyCard
            key={c.code}
            code={c.code}
            flag={c.flag}
            rate={rates[c.code]}
            loading={loading}
            amount={amount}
            index={i}
            onClick={() => openConverter(c.code)}
          />
        ))}
      </div>
      {updated && (
        <div className="text-[10px] text-muted-foreground text-right mt-2">
          Updated: {new Date(updated).toLocaleString()}
        </div>
      )}

      {/* Converter Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CurrencyConverterModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialCurrencyCode={selectedCurrency}
            rates={rates}
            updatedTime={updated}
            currencies={CURRENCIES}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

