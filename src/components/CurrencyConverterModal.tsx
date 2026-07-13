import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpDown, Copy, Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import CurrencyInput from "./CurrencyInput";

interface CurrencyOption {
  code: string;
  flag: string;
  name: string;
}

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCurrencyCode: string;
  rates: Record<string, number>;
  updatedTime: string;
  currencies: CurrencyOption[];
}

export default function CurrencyConverterModal({
  isOpen,
  onClose,
  initialCurrencyCode,
  rates,
  updatedTime,
  currencies,
}: CurrencyConverterModalProps) {
  const [selectedCode, setSelectedCode] = useState(initialCurrencyCode);
  const [isSwapped, setIsSwapped] = useState(false);
  const [sourceAmount, setSourceAmount] = useState("1");
  const [targetAmount, setTargetAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Get current selected currency info
  const selectedCurrency = currencies.find((c) => c.code === selectedCode) || {
    code: "USD",
    flag: "🇺🇸",
    name: "United States Dollar",
  };

  const inrCurrency = {
    code: "INR",
    flag: "🇮🇳",
    name: "Indian Rupee",
  };

  const rate = rates[selectedCode] || 1;

  // Sync initial currency when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCode(initialCurrencyCode);
      setIsSwapped(false);
      setSourceAmount("1");
      setCopied(false);
      
      const initialRate = rates[initialCurrencyCode] || 1;
      setTargetAmount(initialRate.toFixed(2));
    }
  }, [isOpen, initialCurrencyCode, rates]);

  // Recalculate if selected currency changes or rates change
  const handleCurrencyChange = (newCode: string) => {
    setSelectedCode(newCode);
    const newRate = rates[newCode] || 1;
    const numSource = parseFloat(sourceAmount);
    
    if (isNaN(numSource)) {
      setTargetAmount("");
      return;
    }

    if (!isSwapped) {
      // Selected -> INR
      setTargetAmount((numSource * newRate).toFixed(2));
    } else {
      // INR -> Selected
      setTargetAmount((numSource / newRate).toFixed(4));
    }
  };

  // Handle typing in source (top) field
  const handleSourceChange = (value: string) => {
    setSourceAmount(value);
    const num = parseFloat(value);
    if (isNaN(num)) {
      setTargetAmount("");
      return;
    }

    if (!isSwapped) {
      // Selected -> INR
      setTargetAmount((num * rate).toFixed(2));
    } else {
      // INR -> Selected
      setTargetAmount((num / rate).toFixed(4));
    }
  };

  // Handle typing in target (bottom) field
  const handleTargetChange = (value: string) => {
    setTargetAmount(value);
    const num = parseFloat(value);
    if (isNaN(num)) {
      setSourceAmount("");
      return;
    }

    if (!isSwapped) {
      // Selected -> INR (so bottom is INR, we want to compute Selected)
      setSourceAmount((num / rate).toFixed(4));
    } else {
      // INR -> Selected (so bottom is Selected, we want to compute INR)
      setSourceAmount((num * rate).toFixed(2));
    }
  };

  // Swap currencies
  const handleSwap = () => {
    setIsSwapped((prev) => !prev);
    setSourceAmount(targetAmount);
    setTargetAmount(sourceAmount);
  };

  // Copy result to clipboard
  const handleCopy = () => {
    if (!targetAmount) return;
    
    const targetSymbol = isSwapped ? selectedCurrency.code : "INR";
    const textToCopy = `${targetAmount}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        toast.success(`Copied ${textToCopy} ${targetSymbol} to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
          className="glass-strong relative w-full max-w-md p-6 sm:p-8 rounded-[24px] shadow-2xl border border-white/10 overflow-hidden"
          ref={modalRef}
        >
          {/* Accent Glow Background Effects */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{selectedCurrency.flag}</span>
                <span>{selectedCurrency.code} Converter</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Two-way live exchange rates calculator
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/15 hover:scale-105 active:scale-95 transition-all outline-none"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Rate Display */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-6">
            <span className="font-semibold text-white/80">
              {!isSwapped
                ? `1 ${selectedCurrency.code} = ₹${rate.toFixed(2)}`
                : `1 INR = ${(1 / rate).toFixed(5)} ${selectedCurrency.code}`}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Rate
            </div>
          </div>

          {/* Input Cards */}
          <div className="flex flex-col gap-2 relative">
            {/* Top Input (Source) */}
            <CurrencyInput
              label={!isSwapped ? "From" : "From"}
              value={sourceAmount}
              onChange={handleSourceChange}
              currencyCode={!isSwapped ? selectedCurrency.code : inrCurrency.code}
              currencyFlag={!isSwapped ? selectedCurrency.flag : inrCurrency.flag}
              currencyName={!isSwapped ? selectedCurrency.name : inrCurrency.name}
              onCurrencyChange={!isSwapped ? handleCurrencyChange : undefined}
              currencies={!isSwapped ? currencies : undefined}
            />

            {/* Swap Button (Floating) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.button
                whileHover={{ scale: 1.12, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                onClick={handleSwap}
                className="w-10 h-10 rounded-full bg-gradient-pink-blue flex items-center justify-center text-white shadow-lg hover:shadow-glow-pink border border-white/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                title="Swap Currencies"
              >
                <ArrowUpDown className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Gap for the swap button */}
            <div className="h-4" />

            {/* Bottom Input (Target) */}
            <CurrencyInput
              label={!isSwapped ? "To" : "To"}
              value={targetAmount}
              onChange={handleTargetChange}
              currencyCode={!isSwapped ? inrCurrency.code : selectedCurrency.code}
              currencyFlag={!isSwapped ? inrCurrency.flag : selectedCurrency.flag}
              currencyName={!isSwapped ? inrCurrency.name : selectedCurrency.name}
              onCurrencyChange={isSwapped ? handleCurrencyChange : undefined}
              currencies={isSwapped ? currencies : undefined}
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <button
              onClick={handleCopy}
              disabled={!targetAmount}
              className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/25 outline-none"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-primary-glow" />
                  <span>Copy Result</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-pink-blue hover:opacity-90 text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-98 transition-all shadow-glow-pink outline-none"
            >
              <span>Done</span>
            </button>
          </div>

          {/* Footer Metadata */}
          {updatedTime && (
            <div className="flex items-center justify-center gap-1.5 mt-5 text-[10px] text-muted-foreground text-center">
              <Calendar className="w-3 h-3" />
              <span>
                Rates updated: {new Date(updatedTime).toLocaleString()}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
