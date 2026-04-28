import { useState } from "react";
import { PIPELINE_STEPS, PipelineResult } from "@/lib/mockScenarios";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, Route, Clock, Server, PlayCircle, FileText, CheckCircle2, Circle, ChevronRight, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";

const icons = {
  detect: Activity,
  analyze: AlertTriangle,
  route: Route,
  sla: Clock,
  load: Server,
  execute: PlayCircle,
  audit: FileText,
};

interface PipelineProps {
  currentStepIndex: number;
  status: "idle" | "processing" | "completed";
  result: PipelineResult | null;
  aiStatus?: "idle" | "thinking" | "ready" | "fallback";
  aiSummary?: string | null;
}

export function Pipeline({ currentStepIndex, status, result, aiStatus = "idle", aiSummary = null }: PipelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const expandAll = () => {
    const all = PIPELINE_STEPS.reduce((acc, step) => ({ ...acc, [step.id]: true }), {});
    setExpandedSteps(all);
  };

  const collapseAll = () => {
    setExpandedSteps({});
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl border border-white/10 bg-card/40 p-6 backdrop-blur-md shadow-2xl relative"
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Pipeline Execution</h2>
          {aiStatus === "thinking" && (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-purple-400/30 text-purple-200">
              <Loader2 className="h-3 w-3 animate-spin" />
              Gemini reasoning
            </span>
          )}
          {aiStatus === "ready" && (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-purple-400/30 text-purple-200">
              <Sparkles className="h-3 w-3" />
              AI reasoning live
            </span>
          )}
          {aiStatus === "fallback" && (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-200">
              <Sparkles className="h-3 w-3" />
              Cached reasoning
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={expandAll} className="text-xs text-muted-foreground hover:text-white transition-colors">Expand all</button>
          <span className="text-muted-foreground/50">|</span>
          <button onClick={collapseAll} className="text-xs text-muted-foreground hover:text-white transition-colors">Collapse all</button>
        </div>
      </div>

      {aiSummary && aiStatus === "ready" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 px-3 py-2 rounded-lg border border-purple-400/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5 text-xs text-purple-100/90 flex items-start gap-2"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-300 mt-0.5 shrink-0" />
          <span><span className="font-semibold text-purple-200">Agent verdict:</span> {aiSummary}</span>
        </motion.div>
      )}
      
      <div className="relative flex flex-col gap-6">
        <div className="absolute left-6 top-6 bottom-6 w-px bg-white/10" />
        <motion.div 
          className="absolute left-6 top-6 w-px bg-primary origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: status === "completed" ? 1 : currentStepIndex >= 0 ? (currentStepIndex + 0.5) / PIPELINE_STEPS.length : 0 }}
          transition={{ duration: 0.5 }}
        />

        {PIPELINE_STEPS.map((step, index) => {
          const Icon = icons[step.id as keyof typeof icons];
          const isCompleted = status === "completed" || (status === "processing" && index < currentStepIndex);
          const isProcessing = status === "processing" && index === currentStepIndex;
          const isPending = status === "idle" || (status === "processing" && index > currentStepIndex);
          const isExpanded = expandedSteps[step.id];

          const reasoning = result?.reasoning?.[step.id];
          const hasReasoning = isCompleted && reasoning && reasoning.length > 0;
          
          // Generate a fake confidence for demo purposes based on step name length or use a fixed high number
          const confidence = hasReasoning ? 85 + (step.name.length % 14) : 0;

          return (
            <div key={step.id} className="relative z-10 flex items-start gap-4 group">
              <div className="relative mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background border border-white/10 z-10">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </motion.div>
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/30" />
                )}
                {isProcessing && (
                  <span className="absolute inset-0 rounded-full border border-primary animate-ping opacity-20" />
                )}
              </div>

              <div className={`flex flex-col flex-1 rounded-lg transition-colors ${isProcessing ? 'bg-primary/5 border border-primary/20' : 'group-hover:bg-white/5 border border-transparent'}`}>
                <div 
                  className={`p-3 flex flex-col cursor-pointer`}
                  onClick={() => {
                    if (hasReasoning || isProcessing || isCompleted) toggleStep(step.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isCompleted ? 'text-white' : isProcessing ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.name}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground flex items-center gap-2">
                        {step.agent}
                        {hasReasoning && (
                          <span className="flex items-center gap-1 text-emerald-400 border-l border-white/20 pl-2">
                            {confidence}% conf
                            <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400" style={{ width: `${confidence}%` }} />
                            </div>
                          </span>
                        )}
                      </span>
                    </div>
                    {((hasReasoning) || isProcessing || isCompleted) && (
                      <button className="text-muted-foreground hover:text-white p-1">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  
                  {isProcessing && !isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 flex items-center gap-2 text-xs text-primary"
                    >
                      <Activity className="h-3 w-3 animate-pulse" />
                      <span>Processing...</span>
                    </motion.div>
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && (isCompleted || isProcessing) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 border-t border-white/5 mt-1">
                        {hasReasoning ? (
                          <div className="flex flex-col gap-2 mt-3 ml-2">
                            {reasoning.map((thought, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-2 text-xs font-mono text-muted-foreground"
                              >
                                <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                <span className="bg-black/30 border border-white/5 rounded px-2 py-1 flex-1 break-words">{thought}</span>
                              </motion.div>
                            ))}
                          </div>
                        ) : isProcessing ? (
                          <div className="text-xs font-mono text-muted-foreground italic pl-4 py-2">
                            <Activity className="h-3 w-3 inline mr-2 animate-pulse text-primary" />
                            Awaiting telemetry...
                          </div>
                        ) : (
                          <div className="text-xs font-mono text-muted-foreground italic pl-4 py-2">
                            No reasoning trace available.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
