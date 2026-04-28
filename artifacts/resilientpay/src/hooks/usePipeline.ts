import { useState, useCallback, useRef } from "react";
import { getResultForInput, PIPELINE_STEPS, PipelineResult } from "@/lib/mockScenarios";
import { useToast } from "@/hooks/use-toast";

export type PipelineStatus = "idle" | "processing" | "completed";

export interface PipelineState {
  status: PipelineStatus;
  currentStepIndex: number;
  result: PipelineResult | null;
  history: PipelineResult[];
  run: (input: string) => Promise<void>;
  reset: () => void;
  loadHistory: (result: PipelineResult) => void;
}

export function usePipeline(): PipelineState {
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [history, setHistory] = useState<PipelineResult[]>([]);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const run = useCallback(async (input: string) => {
    if (!input.trim()) {
      toast({ title: "Input Required", description: "Please enter failure details to analyze.", variant: "destructive" });
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setStatus("processing");
    setCurrentStepIndex(0);
    setResult(null);

    // Simulate steps
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setCurrentStepIndex(i);
      
      // Variable delay between 600ms and 1100ms
      const delay = Math.floor(Math.random() * 500) + 600;
      
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(resolve, delay);
          signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(new Error("Aborted"));
          });
        });
      } catch (e) {
        if (signal.aborted) return;
      }
    }

    if (signal.aborted) return;

    const finalResult = {
      ...getResultForInput(input),
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date()
    };
    
    setResult(finalResult);
    setStatus("completed");
    setCurrentStepIndex(-1);
    
    setHistory(prev => [finalResult, ...prev].slice(0, 5));
    
  }, [toast]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus("idle");
    setCurrentStepIndex(-1);
    setResult(null);
  }, []);

  const loadHistory = useCallback((pastResult: PipelineResult) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus("completed");
    setCurrentStepIndex(-1);
    setResult(pastResult);
  }, []);

  return { status, currentStepIndex, result, history, run, reset, loadHistory };
}
