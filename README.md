# ResilientPay

**Autonomous Payment Recovery System — AI-powered fintech demo**

ResilientPay is a full-stack demo application that simulates an AI agent autonomously recovering failed payment transactions. It classifies failure types, selects optimal fallback routes, generates step-by-step reasoning traces using Google Gemini, and produces a full audit log — all within a 7-step animated pipeline.

Built as a hackathon-quality project to demonstrate real-world AI agent patterns in a fintech context.

---

## Live Demo

Hosted on Replit — paste any payment failure log and watch the agent recover it in real time.

---

## Features

- **Real Gemini AI integration** — each pipeline run sends the failure input to Gemini 2.5 Flash, which generates per-step reasoning, severity classification, and an agent verdict
- **7-step autonomous pipeline** — Failure Detection, Severity Analysis, Route Selection, SLA Monitoring, Load Analysis, Auto Recovery Execution, Audit Logging
- **Live network ticker** — scrolling feed of simulated global payment recoveries
- **Auto-Demo Mode** — cycles through unique scenarios every 15–20 seconds automatically
- **Recovery Analytics** — bar and area charts showing recovery trends, success rates, and latency
- **Session History** — last 6 runs stored in-session with one-click replay
- **AI fallback** — if the Gemini API is unavailable, the system falls back to cached reasoning without breaking the demo
- **Custom input** — paste any free-form payment failure text; the agent parses the amount, error type, and SLA constraints automatically
- **Responsive design** — works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| Charts | Recharts |
| Backend | Node.js, Express |
| AI | Google Gemini API (gemini-2.5-flash) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
artifacts/
  resilientpay/        # React + Vite frontend
    src/
      components/      # Pipeline, InputPanel, OutputDashboard, etc.
      hooks/           # usePipeline, useAutoDemo
      lib/             # mockScenarios, scenario data
      pages/           # Home page
  api-server/          # Express backend
    src/
      routes/
        agent.ts       # POST /api/agent/analyze — Gemini integration
lib/
  integrations-gemini-ai/  # Gemini AI client library
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- A Gemini API key (or use Replit's built-in AI integrations)

### Install

```bash
pnpm install
```

### Environment Variables

```env
AI_INTEGRATIONS_GEMINI_BASE_URL=<your-gemini-base-url>
AI_INTEGRATIONS_GEMINI_API_KEY=<your-gemini-api-key>
SESSION_SECRET=<any-random-string>
```

### Run

```bash
# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (port assigned by Vite)
pnpm --filter @workspace/resilientpay run dev
```

---

## How the AI Agent Works

When you click **Run Recovery Pipeline**:

1. The 7-step animation begins immediately (visual feedback)
2. Simultaneously, the failure input is sent to the Express backend at `POST /api/agent/analyze`
3. The backend calls Gemini 2.5 Flash with a structured prompt including the failure text, transaction amount, error type, and each pipeline step ID
4. Gemini returns a JSON object containing:
   - `reasoning` — 3 lines of explanation per step (detect, analyze, route, sla, load, execute, audit)
   - `summary` — one-sentence agent verdict
   - `severity` — Low / Medium / High / Critical
5. The AI reasoning is merged into the result and displayed under each pipeline step
6. A **"Gemini reasoning"** badge and **"Agent verdict"** banner confirm live AI output

If the API call fails or times out, the pipeline falls back to pre-written reasoning and shows a **"Cached reasoning"** badge.

---

## Example Input

Paste this into the input panel to test a custom failure:

```
Error 504 - Gateway Timeout
Merchant ID: 8829
Transaction ID: TXN78451239
Amount: $200,000
Currency: USD
Payment Method: Bank API
Status: FAILED
Timestamp: 2026-05-02T10:15:23Z
Reason: Primary bank API not responding
```

The agent will parse the amount, classify the 504 error, select a fallback route, and generate Gemini-powered reasoning for every step.

---

## Resume Context

This project demonstrates:

- **Gemini API** — real LLM calls with JSON-mode responses and structured prompt engineering
- **AI agent UX patterns** — streaming-style step-by-step reasoning, confidence badges, live/fallback status
- **Full-stack TypeScript** — shared types across React frontend and Express backend via pnpm workspaces
- **Production patterns** — graceful degradation, abort controllers, idempotency awareness, audit logging

---

## License

MIT
