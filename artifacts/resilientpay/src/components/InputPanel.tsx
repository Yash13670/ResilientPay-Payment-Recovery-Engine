import { useState } from "react";
import { PREBUILT_SCENARIOS } from "@/lib/mockScenarios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface InputPanelProps {
  onRun: (input: string) => void;
  isProcessing: boolean;
}

export function InputPanel({ onRun, isProcessing }: InputPanelProps) {
  const [input, setInput] = useState("");

  const handleRun = () => {
    onRun(input);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-card/40 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Payment Failure Input
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Paste payment logs, errors, or incident descriptions to initiate autonomous recovery.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PREBUILT_SCENARIOS.map((scenario) => (
          <button
            key={scenario.name}
            onClick={() => setInput(scenario.inputText)}
            disabled={isProcessing}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            {scenario.name}
          </button>
        ))}
      </div>

      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Transaction failed: $200,000 due to gateway timeout. SLA 24 hours. Immediate recovery required."
          className="min-h-[200px] resize-none border-white/10 bg-black/40 font-mono text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/50"
          disabled={isProcessing}
        />
      </div>

      <Button
        onClick={handleRun}
        disabled={!input.trim() || isProcessing}
        className="w-full relative overflow-hidden group border border-primary/50 bg-primary/20 hover:bg-primary/30 text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Pipeline Active...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Run Recovery Pipeline
          </>
        )}
      </Button>
    </motion.div>
  );
}
