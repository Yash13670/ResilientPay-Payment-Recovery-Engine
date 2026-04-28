import { useState, useEffect, useCallback, useRef } from "react";
import { PREBUILT_SCENARIOS } from "@/lib/mockScenarios";
import { PipelineState } from "./usePipeline";
import { useToast } from "./use-toast";

export function useAutoDemo(pipeline: PipelineState) {
  const [enabled, setEnabledState] = useState(() => {
    const saved = localStorage.getItem("resilientpay_autodemo");
    return saved === "true";
  });
  const [pausedFor, setPausedFor] = useState(0);
  const { toast } = useToast();
  const pipelineRef = useRef(pipeline);
  pipelineRef.current = pipeline;

  const setEnabled = useCallback((val: boolean) => {
    setEnabledState(val);
    localStorage.setItem("resilientpay_autodemo", String(val));
    if (val) {
      toast({
        title: "Auto-demo enabled",
        description: "Pipeline will run continuously.",
      });
      setPausedFor(0);
    }
  }, [toast]);

  const userInteracted = useCallback(() => {
    if (enabled) {
      setPausedFor(30);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    if (pausedFor > 0) {
      const timer = setInterval(() => setPausedFor((p) => Math.max(0, p - 1)), 1000);
      return () => clearInterval(timer);
    }

    if (pipelineRef.current.status !== "idle" && pipelineRef.current.status !== "completed") {
      return;
    }

    const interval = setInterval(() => {
      if (pipelineRef.current.status === "idle" || pipelineRef.current.status === "completed") {
        const usedNames = new Set(
          pipelineRef.current.history.map((h) => h.scenarioName)
        );
        const available = PREBUILT_SCENARIOS.filter(
          (s) => !usedNames.has(s.result.scenarioName)
        );
        const pool = available.length > 0 ? available : PREBUILT_SCENARIOS;
        const scenario = pool[Math.floor(Math.random() * pool.length)];
        pipelineRef.current.run(scenario.inputText);
      }
    }, 15000 + Math.random() * 5000); // 15-20s

    return () => clearInterval(interval);
  }, [enabled, pausedFor]);

  return { enabled, setEnabled, pausedFor, userInteracted };
}
