# ⚡ AI Startup Idea Validator

> A multi-agent AI system that evaluates startup ideas through three distinct evaluator personas — Venture Capitalist, PM, and Target Customer — in a structured two-round panel debate, producing a consolidated SWOT analysis and investment-grade recommendation.

![Demo](https://img.shields.io/badge/Status-Live-brightgreen) ![Node](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18-blue) ![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange)

---

## 🎯 What It Does

A founder submits a startup idea in plain English. The system runs it through a 5-stage AI pipeline:

1. **Problem Extraction** — Strips the pitch down to the real problem, target user, and key assumptions
2. **Market Research** — Identifies market size, trend, real competitors, and differentiation gaps
3. **Round 1 — Independent Panel** — VC, PM, and Customer each evaluate the idea independently
4. **Round 2 — Reactive Debate** — Each persona reads the others' takes and reacts — agreeing, pushing back, and surfacing new insights
5. **Synthesis** — All arguments are consolidated into a SWOT analysis, pitch readiness score, biggest risk, and founder action plan

The core innovation: **the personas are aware of each other**. The disagreements between them are where the real insight lives.

---

## 🖥️ Live Demo

- **Frontend:** [https://will-it-startup.vercel.app](https://your-vercel-url.vercel.app)
- **Backend API:** [https://startup-idea-validator-uewv.onrender.com](https://startup-idea-validator-uewv.onrender.com)

---

## 🧠 Sample Output

**Idea:** *"An app that connects freelance chefs with busy professionals who want home-cooked meals delivered"*

**VC (Round 1):** *"While the market opportunity is significant, success hinges on executing a complex logistics model and differentiating from established competitors"* — Confidence: 7/10

**PM (Round 1):** *"The idea has potential but lacks concrete plans for Day 1 features and logistics management"* — Confidence: 4/10

**Customer (Round 1):** *"I'd consider this if it convincingly addresses trust and cost concerns"* — Confidence: 6/10

**PM → VC (Round 2 pushback):** *"I push back on the VC's large TAM point — without a clear Day 1 plan, capturing that market is uncertain"*

**Final Verdict:** Conditional Pass | Pitch Score: 72/100

**Biggest Risk:** Executing a complex logistics model with an unproven network of freelance chefs

---

## 🏗️ Architecture

```
startup_validator/
├── backend/                    # Node.js + Express API
│   ├── server.js               # Main Express server — POST /api/validate
│   ├── groqClient.js           # Groq API client + JSON parser
│   └── stages/
│       ├── 01_intake.js        # Stage 1 — Problem extraction
│       ├── 02_market.js        # Stage 2 — Market research
│       ├── 03_round1.js        # Stage 3 — Round 1 independent evaluations
│       ├── 04_round2.js        # Stage 4 — Round 2 reactive panel
│       └── 05_synthesis.js     # Stage 5 — SWOT + score + report
└── frontend/                   # React + Vite
    └── src/
        ├── App.jsx             # Screen controller (4 screens)
        ├── App.css             # Global design system
        └── components/
            ├── IdeaInput       # Screen 1 — Idea submission
            ├── ResearchFeed    # Screen 2 — Live animated research feed
            ├── PanelDebate     # Screen 3 — Roundtable with Round 1/2 toggle
            └── FinalReport     # Screen 4 — SWOT, score, risk, action plan
```

### How a request flows

```
User submits idea
      ↓
POST /api/validate
      ↓
Stage 1: Extract problem statement, target user, assumptions
      ↓
Stage 2: Research market size, trend, competitors, gaps
      ↓
Stage 3: VC + PM + Customer evaluate independently (parallel)
      ↓
Stage 4: Each persona reads the others and reacts (parallel)
      ↓
Stage 5: Synthesize → SWOT + score + risk + action plan
      ↓
Return single JSON payload to frontend
```

---

## 🎭 The Three Evaluator Personas

| Persona | Focus | Communication Style |
|---|---|---|
| 🏦 Venture Capitalist | TAM, moat, scalability, return potential | Direct, impatient, speaks in market multiples |
| 🛠️ Product Manager | MVP, execution risk, Day 1 features, GTM | Structured, systematic, asks about metrics |
| 👤 Target Customer | Does it solve my problem, trust, cost | Blunt, emotional, uses personal examples |

Each persona has a distinct system prompt that defines their mental model, priorities, and voice. In Round 2, they read each other's Round 1 outputs and react — agreeing where they genuinely agree, pushing back where they don't.

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Backend Setup

```bash
cd startup_validator/backend
npm install
cp .env.example .env
# Add your GROQ_API_KEY to .env
node server.js
# Server runs on http://localhost:3001
```

### Frontend Setup

```bash
cd startup_validator/frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

Make sure the backend is running before starting the frontend.

### Testing the API directly

```bash
curl -X POST http://localhost:3001/api/validate \
  -H "Content-Type: application/json" \
  -d "{\"idea\": \"An app that helps college students find part-time tutoring jobs\"}"
```

---

## 🔑 Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

---

## 📊 API Reference

### `POST /api/validate`

**Request:**
```json
{
  "idea": "Your startup idea in plain English"
}
```

**Response:**
```json
{
  "idea": "original idea text",
  "stages": {
    "problem": {
      "problem_statement": "...",
      "target_user": "...",
      "proposed_solution": "...",
      "key_assumptions": ["..."]
    },
    "market": {
      "market_size": "...",
      "market_trend": "...",
      "competitors": [{ "name": "...", "weakness": "..." }],
      "differentiation_gaps": ["..."]
    },
    "round1": {
      "vc": { "overall_sentiment": "cautious", "confidence_score": 7, "one_line_verdict": "...", "key_strengths": [], "key_concerns": [] },
      "pm": { "..." },
      "customer": { "..." }
    },
    "round2": {
      "vc": { "agreements": [], "disagreements": [], "new_insight": "...", "revised_verdict": "...", "revised_confidence": 7 },
      "pm": { "..." },
      "customer": { "..." }
    },
    "synthesis": {
      "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
      "pitch_readiness_score": 72,
      "pitch_readiness_breakdown": { "market_timing": 80, "differentiation": 65, "execution_risk": 60, "founder_clarity": 75 },
      "biggest_risk": "...",
      "investment_recommendation": "Conditional Pass",
      "recommendation_rationale": "...",
      "founder_action_plan": ["...", "...", "..."],
      "panel_consensus": "...",
      "panel_tension": "..."
    }
  }
}
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Component-based, fast dev experience |
| Backend | Node.js + Express | Simple REST API, easy Render deployment |
| AI / LLM | Groq API (Llama 3.3 70B) | Free tier, fast inference |
| Deployment | Render (backend) + Vercel (frontend) | Both have free tiers, easy GitHub integration |

---

## 🔄 Pipeline Design Decisions

**Why sequential stages?**
Each stage builds on the previous one. Market research needs the extracted problem. Round 2 needs Round 1 outputs. Making them sequential ensures each stage has the right context.

**Why parallel in Round 1 and Round 2?**
Within each round, the three personas are independent of each other (in Round 1) or react to the same fixed set of Round 1 outputs (in Round 2). Running them with `Promise.all()` cuts the wait time by 3x.

**Why a two-round debate?**
A single opinion from each persona is just three isolated reports. The debate format — where personas react to each other — surfaces the friction between different evaluator mindsets. A VC and a Customer often disagree about what matters. That tension is where the most useful insight for a founder lives.

**Why structured JSON outputs at every stage?**
Each stage returns a strict JSON schema. This makes the data predictable for downstream stages and for the frontend to render. A `parseJSON()` helper strips markdown fences that LLMs sometimes add.

---

## 📋 Work Order

Built as part of **WO-02** at **Caarya Innovative Solutions Pvt. Ltd.**

**Backbone moves completed:**
- ✅ Idea intake and problem extraction
- ✅ Market and competitor research
- ✅ Three evaluator personas with distinct voices
- ✅ SWOT synthesis and final report
- ✅ Deployed working agent

**Optional moves completed:**
- ✅ Pitch readiness score with sub-scores
- ✅ Biggest risk callout
- ✅ Founder action plan
- ✅ Round 2 reactive panel debate

---

## 👤 Author

**Himanshu Jain**
Intern — Caarya Innovative Solutions Pvt. Ltd.
