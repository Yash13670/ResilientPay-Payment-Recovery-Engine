import { PipelineResult } from "@/lib/mockScenarios";
import { History, ChevronRight } from "lucide-react";

interface SessionHistoryProps {
  history: PipelineResult[];
  onLoad: (result: PipelineResult) => void;
}

export function SessionHistory({ history, onLoad }: SessionHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="mt-12 mb-8">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
        <History className="h-4 w-4" />
        Session History
      </h3>
      <div className="flex flex-wrap gap-2">
        {history.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onLoad(item)}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-card/20 px-4 py-2 hover:bg-card/40 hover:border-white/10 transition-all text-left group"
          >
            <div>
              <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                ${item.amount.toLocaleString()} - {item.route}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.timestamp.toLocaleTimeString()} • {item.status}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
}
