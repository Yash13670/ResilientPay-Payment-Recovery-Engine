export interface Alert {
  id: string;
  severity: "Critical" | "Warning" | "Info";
  message: string;
}

export interface AuditLogEntry {
  id: string;
  agent: string;
  action: string;
  timestamp: Date;
}

export interface PipelineResult {
  id: string;
  timestamp: Date;
  scenarioName: string;
  status: "SUCCESS" | "FAILED" | "RETRYING";
  amount: number;
  route: string;
  latency: number;
  retryCount: number;
  alerts: Alert[];
  auditLog: AuditLogEntry[];
  hash: string;
  block: number;
  network: string;
  timeSaved: number;
  effortReduced: number;
  slaAvoided: number;
  reasoning?: Record<string, string[]>;
}

export const PIPELINE_STEPS = [
  { id: "detect", name: "Failure Detection", description: "Ingest and parse gateway failure logs", agent: "Detector" },
  { id: "analyze", name: "Severity Analysis", description: "Evaluate business impact and SLA risks", agent: "Analyzer" },
  { id: "route", name: "Route Selection", description: "Identify optimal fallback payment rails", agent: "Router" },
  { id: "sla", name: "SLA Monitoring", description: "Calculate recovery time objectives", agent: "SLA Monitor" },
  { id: "load", name: "Load Analysis", description: "Check liquidity and network congestion", agent: "Load Balancer" },
  { id: "execute", name: "Auto Recovery Execution", description: "Dispatch transaction via fallback route", agent: "Executor" },
  { id: "audit", name: "Audit Logging", description: "Record state transitions and generate proof", agent: "Auditor" },
];

export interface Scenario {
  name: string;
  inputText: string;
  result: Omit<PipelineResult, "id" | "timestamp">;
}

export const PREBUILT_SCENARIOS: Scenario[] = [
  {
    name: "Gateway Timeout $200k",
    inputText: "Transaction failed: $200,000 due to gateway timeout. SLA 24 hours. Immediate recovery required.",
    result: {
      scenarioName: "Gateway Timeout $200k",
      status: "SUCCESS",
      amount: 200000,
      route: "Backup Gateway B",
      latency: 412,
      retryCount: 1,
      alerts: [
        { id: "1", severity: "Warning", message: "Primary gateway latency exceeded 5000ms" },
        { id: "2", severity: "Info", message: "Traffic re-routed to regional backup" },
      ],
      auditLog: [
        { id: "1", agent: "Detector", action: "Identified 504 Gateway Timeout error on primary node.", timestamp: new Date() },
        { id: "2", agent: "Analyzer", action: "Assessed medium severity. 24h SLA active.", timestamp: new Date() },
        { id: "3", agent: "Router", action: "Selected Backup Gateway B due to lowest regional latency.", timestamp: new Date() },
        { id: "4", agent: "SLA Monitor", action: "Confirmed recovery within 0.1% of SLA window.", timestamp: new Date() },
        { id: "5", agent: "Load Balancer", action: "Verified sufficient capacity on Backup Gateway B.", timestamp: new Date() },
        { id: "6", agent: "Executor", action: "Transaction executed successfully via fallback.", timestamp: new Date() },
        { id: "7", agent: "Auditor", action: "Ledger updated and cryptographic proof generated.", timestamp: new Date() },
      ],
      hash: "0x8f2a3c9b4e1d7f6a5b8c3e2d1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a",
      block: 18492041,
      network: "Ethereum Mainnet",
      timeSaved: 45,
      effortReduced: 92,
      slaAvoided: 1,
      reasoning: {
        detect: ["Parsed gateway error code GW_TIMEOUT_504", "Matched signature: timeout-during-capture", "Confidence 96.4% — flagged as recoverable"],
        analyze: ["Amount $200,000 > $100k threshold → severity HIGH", "SLA window 24h, elapsed 0h → recovery feasible", "Customer tier: Enterprise — escalation priority +1"],
        route: ["Evaluated 4 fallback routes", "Backup Gateway B selected: 99.2% success on similar incidents", "Estimated route cost: $12.40 — within budget"],
        sla: ["RTO target: 15 minutes", "Current burn: 0% of SLA window", "All compliance checks passed (PCI-DSS, SOC2)"],
        load: ["Backup Gateway B liquidity: 87% available", "Network congestion: low (12ms p50)", "Concurrent recoveries: 4 — within capacity"],
        execute: ["Idempotency key generated: rcv_8f2a...", "Transaction dispatched at 14:32:11.207 UTC", "Settlement confirmation received in 412ms"],
        audit: ["State transitions written to immutable ledger", "Hash anchored to Ethereum block #18492041", "Notification dispatched to ops-payments@channel"]
      }
    }
  },
  {
    name: "Card Network Decline $48k",
    inputText: "Error 05: Do Not Honor. Amount: $48,000. Customer VIP status: True.",
    result: {
      scenarioName: "Card Network Decline $48k",
      status: "RETRYING",
      amount: 48000,
      route: "Alternate Acquirer",
      latency: 1250,
      retryCount: 3,
      alerts: [
        { id: "1", severity: "Critical", message: "VIP Customer payment declined. Churn risk high." },
        { id: "2", severity: "Warning", message: "Multiple declines detected on primary acquirer." },
      ],
      auditLog: [
        { id: "1", agent: "Detector", action: "Parsed '05: Do Not Honor' from Visa network.", timestamp: new Date() },
        { id: "2", agent: "Analyzer", action: "Flagged VIP status. Escalated priority to Critical.", timestamp: new Date() },
        { id: "3", agent: "Router", action: "Selected Alternate Acquirer with different BIN.", timestamp: new Date() },
        { id: "4", agent: "SLA Monitor", action: "Initiated fast-track processing protocol.", timestamp: new Date() },
        { id: "5", agent: "Load Balancer", action: "Allocated dedicated connection pool.", timestamp: new Date() },
        { id: "6", agent: "Executor", action: "Retrying transaction. Attempt 3 in progress.", timestamp: new Date() },
        { id: "7", agent: "Auditor", action: "Logged decline patterns for review.", timestamp: new Date() },
      ],
      hash: "Pending...",
      block: 0,
      network: "Internal Ledger",
      timeSaved: 12,
      effortReduced: 85,
      slaAvoided: 0,
      reasoning: {
        detect: ["Parsed ISO 8583 error code 05", "Hard decline on primary BIN", "Confidence 98.1% — routing required"],
        analyze: ["Customer VIP status detected", "Amount $48,000 within retry limits", "Escalation to Tier 2 support recommended"],
        route: ["Excluded primary acquirer", "Alternate Acquirer 1 selected for secondary attempt", "BIN manipulation enabled"],
        sla: ["No fixed SLA, internal VIP target 5m", "Protocol: aggressive retry active"],
        load: ["Connection pool 2 allocated", "Acquirer API responsive (90ms ping)"],
        execute: ["Retry attempt #1... failed", "Retry attempt #2... failed", "Retry attempt #3 dispatched at 10:14:22 UTC"],
        audit: ["Failed attempts logged to audit trail", "Awaiting final confirmation"]
      }
    }
  },
  {
    name: "FX Settlement Stall $1.2M",
    inputText: "Settlement halted. Counterparty unresponsive. Amount: €1,100,000 (Approx $1.2M). Market closing in 2 hours.",
    result: {
      scenarioName: "FX Settlement Stall $1.2M",
      status: "SUCCESS",
      amount: 1200000,
      route: "Liquidity Provider C",
      latency: 840,
      retryCount: 0,
      alerts: [
        { id: "1", severity: "Critical", message: "Counterparty timeout. $1.2M exposure risk." },
        { id: "2", severity: "Warning", message: "Market close approaching (T-120m)." },
        { id: "3", severity: "Info", message: "Liquidity sourced from Provider C at +1.2bps." },
      ],
      auditLog: [
        { id: "1", agent: "Detector", action: "Detected settlement stall via SWIFT MT199.", timestamp: new Date() },
        { id: "2", agent: "Analyzer", action: "Calculated exposure risk. High severity.", timestamp: new Date() },
        { id: "3", agent: "Router", action: "Sourced alternative liquidity via Provider C.", timestamp: new Date() },
        { id: "4", agent: "SLA Monitor", action: "Ensured settlement completes before market close.", timestamp: new Date() },
        { id: "5", agent: "Load Balancer", action: "Reserved €1.1M from internal treasury.", timestamp: new Date() },
        { id: "6", agent: "Executor", action: "Executed FX swap and settled obligation.", timestamp: new Date() },
        { id: "7", agent: "Auditor", action: "Recorded variance of +1.2bps for accounting.", timestamp: new Date() },
      ],
      hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      block: 847291,
      network: "Private Quorum",
      timeSaved: 180,
      effortReduced: 99,
      slaAvoided: 1,
      reasoning: {
        detect: ["SWIFT MT199 message received", "Counterparty status: UNRESPONSIVE > 45m", "Confidence 99.9% — intervention required"],
        analyze: ["Exposure risk: $1.2M unhedged", "Market close in 1h 55m", "Severity: CRITICAL"],
        route: ["Queried dark pools for €1.1M liquidity", "Provider C offered best rate (+1.2bps)", "Slippage accepted due to time constraint"],
        sla: ["Target finality: 60m", "Cutoff: 16:00 EST", "Trajectory: On track"],
        load: ["Internal treasury reserve queried: OK", "Margin requirements met"],
        execute: ["FX swap executed", "Target settlement confirmed at 14:05 UTC", "Net latency 840ms"],
        audit: ["Variance logged to financial controller", "SWIFT MT202 generated and stored"]
      }
    }
  },
  {
    name: "Stablecoin Bridge Delay $500k",
    inputText: "Cross-chain transfer stuck. Source: Ethereum. Dest: Polygon. Asset: USDC. Value: 500,000.",
    result: {
      scenarioName: "Stablecoin Bridge Delay $500k",
      status: "SUCCESS",
      amount: 500000,
      route: "Direct CCTP",
      latency: 12400,
      retryCount: 0,
      alerts: [
        { id: "1", severity: "Warning", message: "Third-party bridge congestion detected." },
        { id: "2", severity: "Info", message: "Rerouting via Circle CCTP." },
      ],
      auditLog: [
        { id: "1", agent: "Detector", action: "Monitored mempool. Transfer pending > 15 mins.", timestamp: new Date() },
        { id: "2", agent: "Analyzer", action: "Assessed bridge liquidity pool depletion.", timestamp: new Date() },
        { id: "3", agent: "Router", action: "Cancelled original tx. Initiated direct CCTP burn/mint.", timestamp: new Date() },
        { id: "4", agent: "SLA Monitor", action: "Updated expected finality to ~12s.", timestamp: new Date() },
        { id: "5", agent: "Load Balancer", action: "Verified destination chain gas reserves.", timestamp: new Date() },
        { id: "6", agent: "Executor", action: "Submitted CCTP transaction to Ethereum.", timestamp: new Date() },
        { id: "7", agent: "Auditor", action: "Verified attestation and Polygon mint.", timestamp: new Date() },
      ],
      hash: "0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b",
      block: 55928102,
      network: "Polygon PoS",
      timeSaved: 40,
      effortReduced: 100,
      slaAvoided: 0,
      reasoning: {
        detect: ["Ethereum mempool analysis: Tx pending 16m 12s", "Target bridge RPC: 503 Unavailable", "Confidence 94% — bridge failure"],
        analyze: ["Asset: native USDC", "Alternative routing available (Circle CCTP)", "Impact: low risk, high delay"],
        route: ["Native CCTP selected over wrapped asset bridges", "Cost: 45 gwei (Ethereum) + 0.1 MATIC (Polygon)"],
        sla: ["RTO: 15m", "Projected completion: <2m via CCTP"],
        load: ["Ethereum gas price stable", "Polygon RPC nodes responsive"],
        execute: ["Burn tx 0x4f8... confirmed on ETH", "Attestation fetched from Circle API", "Mint tx dispatched to Polygon"],
        audit: ["Cross-chain state verified", "Proof hash recorded to internal ledger"]
      }
    }
  }
];

export const FALLBACK_SCENARIO: Omit<PipelineResult, "id" | "timestamp" | "scenarioName"> = {
  status: "SUCCESS",
  amount: 0,
  route: "Generic Auto-Fallback",
  latency: 350,
  retryCount: 1,
  alerts: [
    { id: "1", severity: "Info", message: "Generic failure detected and resolved." }
  ],
  auditLog: [
    { id: "1", agent: "Detector", action: "Anomaly detected in payment stream.", timestamp: new Date() },
    { id: "2", agent: "Analyzer", action: "General analysis complete.", timestamp: new Date() },
    { id: "3", agent: "Router", action: "Selected generic fallback route.", timestamp: new Date() },
    { id: "4", agent: "SLA Monitor", action: "SLA within acceptable bounds.", timestamp: new Date() },
    { id: "5", agent: "Load Balancer", action: "Capacity checks passed.", timestamp: new Date() },
    { id: "6", agent: "Executor", action: "Recovery executed.", timestamp: new Date() },
    { id: "7", agent: "Auditor", action: "Event logged successfully.", timestamp: new Date() },
  ],
  hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  block: 1000000,
  network: "Testnet",
  timeSaved: 5,
  effortReduced: 50,
  slaAvoided: 0,
  reasoning: {
    detect: ["Anomaly detected in custom payment stream", "Pattern matching applied", "Confidence 85%"],
    analyze: ["Dynamic threshold analysis applied", "Risk assessment: Nominal"],
    route: ["Generic auto-fallback route identified", "Capacity verified"],
    sla: ["SLA constraints verified", "Within operational limits"],
    load: ["Node congestion minimal", "Liquidity check bypassed"],
    execute: ["Fallback execution triggered", "Response received in 350ms"],
    audit: ["Generic execution logged"]
  }
};

export const getResultForInput = (input: string): Omit<PipelineResult, "id" | "timestamp"> => {
  const matched = PREBUILT_SCENARIOS.find(s => s.inputText.trim() === input.trim());
  if (matched) {
    return { ...matched.result };
  }
  
  const amountMatch = input.match(/\$?\s*([\d,]+(?:\.\d+)?)/);
  const amountStr = amountMatch ? amountMatch[1].replace(/,/g, '') : "10000";
  const amount = parseFloat(amountStr) || 10000;

  const isCritical = input.toLowerCase().includes("critical") || input.toLowerCase().includes("sla");

  return {
    ...FALLBACK_SCENARIO,
    scenarioName: "Custom Input",
    amount,
    alerts: isCritical ? [
      { id: "1", severity: "Critical", message: "Custom SLA breach risk detected." },
      ...FALLBACK_SCENARIO.alerts
    ] : FALLBACK_SCENARIO.alerts,
  };
};
