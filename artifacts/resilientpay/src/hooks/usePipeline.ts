import { useState, useCallback, useRef } from "react";
import { getResultForInput, PIPELINE_STEPS, PipelineResult } from "@/lib/mockScenarios";
import { useToast } from "@/hooks/use-toast";

export type PipelineStatus = "idle" | "processing" | "completed";

export interface PipelineState {
  status: PipelineStatus;
  currentStepIndex: number;
  result: PipelineResult | null;
  history: PipelineResult[];
  activeId: string | null;
  loadToken: number;
  aiStatus: "idle" | "thinking" | "ready" | "fallback";
  aiSummary: string | null;
  run: (input: string) => Promise<void>;
  reset: () => void;
  loadHistory: (result: PipelineResult) => void;
  clearHistory: () => void;
}

interface AgentAnalysisResponse {
  reasoning: Record<string, string[]>;
  summary: string;
  severity: string;
}

async function fetchAgentAnalysis(
  input: string,
  base: Omit<PipelineResult, "id" | "timestamp">,
  signal: AbortSignal,
): Promise<AgentAnalysisResponse | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}api/agent/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        scenarioName: base.scenarioName,
        status: base.status,
        amount: base.amount,
        route: base.route,
      }),
      signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AgentAnalysisResponse;
    if (!data || typeof data !== "object" || !data.reasoning) return null;
    return data;
  } catch {
    return null;
  }
}

export function usePipeline(): PipelineState {
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [history, setHistory] = useState<PipelineResult[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadToken, setLoadToken] = useState<number>(0);
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "ready" | "fallback">("idle");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
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
    setActiveId(null);
    setAiStatus("thinking");
    setAiSummary(null);

    const baseResult = getResultForInput(input);
    const aiPromise = fetchAgentAnalysis(input, baseResult, signal);

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setCurrentStepIndex(i);
      const delay = Math.floor(Math.random() * 500) + 600;
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(resolve, delay);
          signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(new Error("Aborted"));
          });
        });
      } catch {
        if (signal.aborted) return;
      }
    }

    if (signal.aborted) return;

    const aiData = await aiPromise;
    if (signal.aborted) return;

    const mergedReasoning = aiData?.reasoning ?? baseResult.reasoning;
    const finalResult: PipelineResult = {
      ...baseResult,
      reasoning: mergedReasoning,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
    };

    setResult(finalResult);
    setStatus("completed");
    setCurrentStepIndex(-1);
    setActiveId(finalResult.id);
    setLoadToken((t) => t + 1);
    setAiStatus(aiData ? "ready" : "fallback");
    setAiSummary(aiData?.summary ?? null);
    setHistory((prev) => [finalResult, ...prev].slice(0, 6));
  }, [toast]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus("idle");
    setCurrentStepIndex(-1);
    setResult(null);
    setActiveId(null);
    setAiStatus("idle");
    setAiSummary(null);
  }, []);

  const loadHistory = useCallback((pastResult: PipelineResult) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus("completed");
    setCurrentStepIndex(-1);
    setResult(pastResult);
    setActiveId(pastResult.id);
    setLoadToken((t) => t + 1);
    setAiStatus("ready");
    setAiSummary(null);
    toast({
      title: "Run restored",
      description: `${pastResult.scenarioName} • ${pastResult.status}`,
      duration: 2000,
    });
  }, [toast]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setActiveId(null);
  }, []);

  return { status, currentStepIndex, result, history, activeId, loadToken, aiStatus, aiSummary, run, reset, loadHistory, clearHistory };
}
