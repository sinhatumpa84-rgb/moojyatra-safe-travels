import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CurrencyOption {
  code: string;
  flag: string;
  name: string;
}

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  currencyCode: string;
  currencyFlag: string;
  currencyName?: string;
  label: string;
  onCurrencyChange?: (code: string) => void;
  currencies?: CurrencyOption[];
  readOnly?: boolean;
}

export default function CurrencyInput({
  value,
  onChange,
  currencyCode,
  currencyFlag,
  currencyName,
  label,
  onCurrencyChange,
  currencies,
  readOnly = false,
}: CurrencyInputProps) {
  const handleInputChange = (val: string) => {
    // Only allow numbers and a single decimal point
    const sanitized = val.replace(/[^0-9.]/g, "");
    
    // Ensure only one decimal point is allowed
    const parts = sanitized.split(".");
    if (parts.length > 2) return;
    
    // Limit decimal places to 6
    if (parts[1] && parts[1].length > 6) {
      onChange(`${parts[0]}.${parts[1].slice(0, 6)}`);
      return;
    }
    
    onChange(sanitized);
  };

  return (
    <div
      className={cn(
        "glass-strong p-4 rounded-xl border transition-all duration-300 w-full flex flex-col gap-2 relative bg-white/5",
        readOnly ? "border-white/10" : "border-white/15 focus-within:border-primary/40 focus-within:shadow-glow-pink/10"
      )}
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {currencyName && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
            {currencyName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="0.00"
          readOnly={readOnly}
          className={cn(
            "bg-transparent text-2xl sm:text-3xl font-extrabold text-white outline-none w-full min-w-0 border-none p-0 focus:ring-0",
            readOnly ? "text-white/80 cursor-default" : "text-white focus:text-primary-glow"
          )}
        />

        {onCurrencyChange && currencies ? (
          <Select value={currencyCode} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-auto h-auto min-w-[100px] shrink-0 border-none bg-white/10 hover:bg-white/15 active:scale-95 transition-all py-1.5 px-2.5 rounded-lg text-white font-bold flex items-center gap-2">
              <SelectValue>
                <div className="flex items-center gap-1.5 text-base">
                  <span>{currencyFlag}</span>
                  <span>{currencyCode}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/15 bg-slate-950/90 text-white max-h-64 overflow-y-auto">
              {currencies.map((c) => (
                <SelectItem
                  key={c.code}
                  value={c.code}
                  className="focus:bg-primary/20 focus:text-white text-white/90 hover:bg-white/10 font-medium cursor-pointer"
                >
                  <span className="mr-2">{c.flag}</span>
                  <span className="font-semibold">{c.code}</span>
                  <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
                    — {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0 bg-white/5 border border-white/10 py-1.5 px-3 rounded-lg text-white font-bold select-none text-base">
            <span>{currencyFlag}</span>
            <span>{currencyCode}</span>
          </div>
        )}
      </div>
    </div>
  );
}
