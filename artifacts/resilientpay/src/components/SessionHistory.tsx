import { PipelineResult } from "@/lib/mockScenarios";
import { History, ChevronRight, CheckCircle2, XCircle, RefreshCw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SessionHistoryProps {
  history: PipelineResult[];
  activeId: string | null;
  onLoad: (result: PipelineResult) => void;
  onClear: () => void;
}

function formatRelative(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function SessionHistory({ history, activeId, onLoad, onClear }: SessionHistoryProps) {
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
            <History className="h-4 w-4 text-blue-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Session History</h3>
            <p className="text-xs text-muted-foreground">Click any run to restore its dashboard</p>
          </div>
          <span className="ml-2 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full bg-white/5 border border-white/10 text-muted-foreground">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence initial={false}>
          {history.map((item) => {
            const isActive = item.id === activeId;
            const isSuccess = item.status === "SUCCESS";
            const isFailed = item.status === "FAILED";
            const StatusIcon = isSuccess ? CheckCircle2 : isFailed ? XCircle : RefreshCw;
            const accent = isSuccess
              ? "text-emerald-400"
              : isFailed
              ? "text-rose-400"
              : "text-amber-400";
            const accentBg = isSuccess
              ? "bg-emerald-500/10 border-emerald-500/30"
              : isFailed
              ? "bg-rose-500/10 border-rose-500/30"
              : "bg-amber-500/10 border-amber-500/30";

            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onLoad(item)}
                className={`relative text-left rounded-xl border p-4 transition-all overflow-hidden group ${
                  isActive
                    ? "border-blue-400/50 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-transparent shadow-[0_0_24px_-6px_rgba(59,130,246,0.5)]"
                    : "border-white/5 bg-card/30 hover:border-white/15 hover:bg-card/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-history-glow"
                    className="absolute inset-0 rounded-xl ring-1 ring-blue-400/40 pointer-events-none"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                      {formatRelative(item.timestamp)}
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {item.scenarioName}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider shrink-0 ${accentBg} ${accent}`}>
                    <StatusIcon className="h-3 w-3" />
                    {item.status}
                  </div>
                </div>

                <div className="relative flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Recovered</div>
                    <div className="text-lg font-mono text-white tracking-tight">
                      ${item.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-0.5">Route</div>
                    <div className="text-xs font-medium text-blue-300/90 truncate max-w-[120px]">
                      {item.route}
                    </div>
                  </div>
                </div>

                <div className="relative mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${isActive ? "text-blue-300" : "text-muted-foreground"}`}>
                    {isActive ? "Currently Loaded" : "View Details"}
                  </span>
                  <ChevronRight className={`h-3.5 w-3.5 transition-all ${isActive ? "text-blue-300 translate-x-0.5" : "text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"}`} />
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
