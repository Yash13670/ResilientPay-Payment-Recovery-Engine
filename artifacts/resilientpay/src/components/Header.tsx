import { useState, useEffect } from "react";
import { Activity, Radio, ShieldCheck } from "lucide-react";
import { PipelineStatus } from "@/hooks/usePipeline";
import { motion } from "framer-motion";

export function Header({ status }: { status: PipelineStatus }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-white">Resilient<span className="text-primary">Pay</span></span>
          </div>
          <div className="hidden h-5 w-px bg-white/20 md:block" />
          <span className="hidden text-sm text-muted-foreground md:block">
            Autonomous Payment Recovery Engine
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-2 text-xs font-mono text-muted-foreground sm:flex">
            <span>{time.toISOString().split("T")[1].split(".")[0]} UTC</span>
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          <motion.div 
            layout
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm ${
              status === "idle" 
                ? "border-white/10 bg-white/5 text-muted-foreground" 
                : status === "processing"
                ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            }`}
          >
            {status === "processing" ? (
              <Activity className="h-3 w-3 animate-pulse" />
            ) : (
              <Radio className="h-3 w-3" />
            )}
            <span className="uppercase tracking-wider">
              {status === "idle" ? "System Idle" : status === "processing" ? "Active" : "Ready"}
            </span>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
