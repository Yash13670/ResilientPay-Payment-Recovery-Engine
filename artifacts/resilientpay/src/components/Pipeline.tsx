import { PIPELINE_STEPS } from "@/lib/mockScenarios";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Route, Clock, Server, PlayCircle, FileText, CheckCircle2, Circle } from "lucide-react";

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
}

export function Pipeline({ currentStepIndex, status }: PipelineProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl border border-white/10 bg-card/40 p-6 backdrop-blur-md shadow-2xl relative"
    >
      <h2 className="text-lg font-semibold text-white mb-6">Pipeline Execution</h2>
      
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
          const isCompleted = status === "completed" || index < currentStepIndex;
          const isProcessing = status === "processing" && index === currentStepIndex;
          const isPending = status === "idle" || (status === "processing" && index > currentStepIndex);

          return (
            <div key={step.id} className="relative z-10 flex items-start gap-4 group">
              <div className="relative mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background border border-white/10">
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

              <div className={`flex flex-col rounded-lg p-3 transition-colors ${isProcessing ? 'bg-primary/5 border border-primary/20' : 'group-hover:bg-white/5'}`}>
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${isCompleted ? 'text-white' : isProcessing ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                    {step.agent}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
                
                {isProcessing && (
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
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
