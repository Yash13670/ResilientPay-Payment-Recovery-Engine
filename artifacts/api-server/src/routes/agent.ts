import { Router, type IRouter, type Request, type Response } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router: IRouter = Router();

interface AnalyzeBody {
  input?: string;
  scenarioName?: string;
  status?: string;
  amount?: number;
  route?: string;
}

interface AgentAnalysis {
  reasoning: Record<string, string[]>;
  summary: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}

const STEPS = [
  { id: "detect", name: "Failure Detection", agent: "Detector" },
  { id: "analyze", name: "Severity Analysis", agent: "Analyzer" },
  { id: "route", name: "Route Selection", agent: "Router" },
  { id: "sla", name: "SLA Monitoring", agent: "SLA Monitor" },
  { id: "load", name: "Load Analysis", agent: "Load Balancer" },
  { id: "execute", name: "Auto Recovery Execution", agent: "Executor" },
  { id: "audit", name: "Audit Logging", agent: "Auditor" },
];

router.post("/analyze", async (req: Request, res: Response) => {
  const body = req.body as AnalyzeBody;
  const input = (body.input ?? "").toString().slice(0, 2000);
  const scenarioName = (body.scenarioName ?? "Custom Input").toString();
  const status = (body.status ?? "SUCCESS").toString();
  const route = (body.route ?? "Backup Gateway B").toString();
  const amount = typeof body.amount === "number" ? body.amount : 0;

  if (!input.trim()) {
    res.status(400).json({ error: "input is required" });
    return;
  }

  const stepDescriptions = STEPS.map(
    (s, i) => `${i + 1}. id="${s.id}" name="${s.name}" agent="${s.agent}"`,
  ).join("\n");

  const prompt = `You are the reasoning core of an autonomous payment-recovery AI agent named ResilientPay.

A payment failure has been received. Generate concise, technical, ops-grade reasoning for each step of a 7-step recovery pipeline. Use realistic fintech terminology (gateway codes, idempotency keys, PCI-DSS, SLA windows, settlement times, route confidence, liquidity, SOC2, etc.). Sound decisive and quantitative. No emojis. No markdown.

INCIDENT
- Scenario: ${scenarioName}
- Final outcome: ${status}
- Amount: $${amount.toLocaleString()}
- Selected route: ${route}
- Raw input from operator:
"""
${input}
"""

PIPELINE STEPS (use these exact ids as JSON keys):
${stepDescriptions}

Return ONLY a valid minified JSON object with this exact shape (no prose, no code fences):
{
  "summary": "<one short sentence describing the agent's overall decision>",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "reasoning": {
    "detect":  ["line1", "line2", "line3"],
    "analyze": ["line1", "line2", "line3"],
    "route":   ["line1", "line2", "line3"],
    "sla":     ["line1", "line2", "line3"],
    "load":    ["line1", "line2", "line3"],
    "execute": ["line1", "line2", "line3"],
    "audit":   ["line1", "line2", "line3"]
  }
}

Each step's reasoning must be exactly 3 short lines (max 90 chars each), each line a discrete decision/observation. Make the lines reflect the incident details above. If status is "FAILED", the later steps must reflect failure / escalation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      },
    });

    const text = response.text ?? "";
    let parsed: AgentAnalysis;
    try {
      parsed = JSON.parse(text) as AgentAnalysis;
    } catch (parseErr) {
      req.log.error({ err: parseErr, text }, "Failed to parse Gemini JSON");
      res.status(502).json({ error: "AI returned malformed JSON" });
      return;
    }

    if (!parsed.reasoning || typeof parsed.reasoning !== "object") {
      res.status(502).json({ error: "AI response missing reasoning" });
      return;
    }

    for (const step of STEPS) {
      const lines = parsed.reasoning[step.id];
      if (!Array.isArray(lines) || lines.length === 0) {
        parsed.reasoning[step.id] = ["Reasoning unavailable for this step."];
      }
    }

    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "Gemini agent analyze failed");
    res.status(500).json({ error: "Agent analysis failed" });
  }
});

export default router;
