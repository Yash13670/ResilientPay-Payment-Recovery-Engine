import { useRef } from "react";
import { usePipeline } from "@/hooks/usePipeline";
import { useAutoDemo } from "@/hooks/useAutoDemo";
import { Header } from "@/components/Header";
import { LiveFeed } from "@/components/LiveFeed";
import { InputPanel } from "@/components/InputPanel";
import { Pipeline } from "@/components/Pipeline";
import { OutputDashboard } from "@/components/OutputDashboard";
import { RecoveryAnalytics } from "@/components/RecoveryAnalytics";
import { SessionHistory } from "@/components/SessionHistory";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const pipeline = usePipeline();
  const { status, currentStepIndex, result, history, activeId, loadToken, aiStatus, aiSummary, run, loadHistory, clearHistory } = pipeline;
  const { enabled: autoDemoEnabled, setEnabled: setAutoDemoEnabled, pausedFor, userInteracted } = useAutoDemo(pipeline);
  
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  const handleLoadHistory = (item: Parameters<typeof loadHistory>[0]) => {
    userInteracted();
    loadHistory(item);
    requestAnimationFrame(() => {
      dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleClearHistory = () => {
    userInteracted();
    clearHistory();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col text-foreground font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0" />
      <div className="fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none z-0 mix-blend-screen" />
      <div className="fixed top-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none z-0 mix-blend-screen" />

      <Header status={status} autoDemoEnabled={autoDemoEnabled} setAutoDemoEnabled={setAutoDemoEnabled} pausedFor={pausedFor} />
      <LiveFeed />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <InputPanel onRun={run} isProcessing={status === "processing"} onInteract={userInteracted} />

            {/* Visual spacer on desktop to balance layout */}
            <div className="hidden lg:block flex-1 rounded-xl border border-white/5 bg-card/10 p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="relative h-full flex items-center justify-center text-center px-8">
                <p className="text-sm text-muted-foreground/50">
                  Awaiting failure telemetry.<br />System armed and listening.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Pipeline currentStepIndex={currentStepIndex} status={status} result={result} aiStatus={aiStatus} aiSummary={aiSummary} />
          </div>
        </div>

        <div ref={dashboardRef} className="scroll-mt-24">
          <AnimatePresence mode="wait">
            {result && status === "completed" && (
              <motion.div
                key={`${result.id}-${loadToken}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                className="mt-8 pt-8 border-t border-white/10"
              >
                <OutputDashboard result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <RecoveryAnalytics history={history} />

        <SessionHistory
          history={history}
          activeId={activeId}
          onLoad={handleLoadHistory}
          onClear={handleClearHistory}
        />
      </main>
    </div>
  );
}
