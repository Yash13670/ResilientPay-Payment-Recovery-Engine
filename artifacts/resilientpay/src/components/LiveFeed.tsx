import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Severity = "RECOVERED" | "RETRYING" | "ESCALATED";

interface TickerItem {
  id: string;
  severity: Severity;
  city: string;
  merchant: string;
  amount: number;
  timeLabel: string;
}

const CITIES = ["Singapore", "Frankfurt", "São Paulo", "Lagos", "New York", "Tokyo", "London", "Mumbai", "Dubai", "Toronto"];
const MERCHANTS = ["Stripe-EU", "Adyen-APAC", "Worldpay-NA", "Ayden-LATAM", "Razorpay-IN", "Checkout-GLOBAL"];

function generateItem(): TickerItem {
  const rand = Math.random();
  const severity: Severity = rand < 0.7 ? "RECOVERED" : rand < 0.9 ? "RETRYING" : "ESCALATED";
  const amount = Math.floor(Math.random() * 50000) + 100;
  return {
    id: Math.random().toString(36).substring(2, 9),
    severity,
    city: CITIES[Math.floor(Math.random() * CITIES.length)],
    merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    amount,
    timeLabel: "1s ago",
  };
}

export function LiveFeed() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const initial = Array.from({ length: 15 }, generateItem);
    setItems(initial);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setItems((prev) => {
        const newItems = [generateItem(), ...prev].slice(0, 30);
        return newItems.map((item) => {
          let t = parseInt(item.timeLabel) + Math.floor(Math.random() * 3 + 2);
          if (isNaN(t)) t = 1;
          return { ...item, timeLabel: `${t}s ago` };
        });
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className="w-full h-11 border-b border-white/5 bg-card/60 backdrop-blur-md flex items-center overflow-hidden relative z-40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-background via-background to-transparent pr-8 pl-4">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-white/90">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Live Network
        </div>
      </div>

      <div className="flex-1 overflow-hidden h-full flex items-center pl-36 mask-image-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div 
          className="flex items-center gap-8 whitespace-nowrap"
          animate={{ x: isHovered ? 0 : "-50%" }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          style={{ willChange: "transform" }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs font-mono group cursor-default">
              <span className={`h-1.5 w-1.5 rounded-full ${
                item.severity === "RECOVERED" ? "bg-emerald-500" :
                item.severity === "RETRYING" ? "bg-amber-500" :
                "bg-red-500"
              }`} />
              <span className="text-white/80">{item.city}</span>
              <span className="text-white/20">•</span>
              <span className="text-blue-300/80">{item.merchant}</span>
              <span className="text-white/20">•</span>
              <span className="text-white">${item.amount.toLocaleString()}</span>
              <span className="text-white/20">•</span>
              <span className={`uppercase tracking-wider text-[10px] ${
                item.severity === "RECOVERED" ? "text-emerald-400" :
                item.severity === "RETRYING" ? "text-amber-400" :
                "text-red-400"
              }`}>{item.severity}</span>
              <span className="text-white/20">•</span>
              <span className="text-muted-foreground">{item.timeLabel}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
