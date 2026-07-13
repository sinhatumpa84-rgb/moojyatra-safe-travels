import { motion } from "framer-motion";

interface CurrencyCardProps {
  code: string;
  flag: string;
  rate?: number;
  loading: boolean;
  amount?: number;
  index: number;
  onClick: () => void;
}

export default function CurrencyCard({
  code,
  flag,
  rate,
  loading,
  amount = 1,
  index,
  onClick,
}: CurrencyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.03 
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="glass p-5 text-center hover:bg-white/15 transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background group relative overflow-hidden"
    >
      {/* Decorative hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      <div className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110">{flag}</div>
      <div className="text-xs text-muted-foreground font-medium mb-1">1 {code} =</div>
      <div className="text-xl font-extrabold gradient-text tracking-tight">
        {loading ? (
          <span className="inline-block w-8 h-5 skeleton" />
        ) : rate ? (
          `₹${(rate * amount).toFixed(2)}`
        ) : (
          "—"
        )}
      </div>
    </motion.div>
  );
}
