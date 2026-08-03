require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { extractProblem } = require("./stages/01_intake");
const { researchMarket } = require("./stages/02_market");
const { runRound1 } = require("./stages/03_round1");
const { runRound2 } = require("./stages/04_round2");
const { synthesize } = require("./stages/05_synthesis");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "AI Startup Validator" });
});

app.post("/api/validate", async (req, res) => {
  const { idea } = req.body;

  if (!idea || idea.trim().length < 10) {
    return res.status(400).json({ error: "Please provide a startup idea (at least 10 characters)" });
  }

  console.log(`\n🚀 Validating: "${idea.substring(0, 60)}..."`);

  try {
    console.log("📋 Stage 1: Extracting problem...");
    const problemData = await extractProblem(idea);
    console.log("✅ Done");

    console.log("📊 Stage 2: Researching market...");
    const marketData = await researchMarket(problemData);
    console.log("✅ Done");

    console.log("🎭 Stage 3: Round 1 — independent evaluations...");
    const round1 = await runRound1(problemData, marketData);
    console.log("✅ Done");

    console.log("💬 Stage 4: Round 2 — panel reactions...");
    const round2 = await runRound2(problemData, round1);
    console.log("✅ Done");

    console.log("🧠 Stage 5: Synthesizing final report...");
    const synthesis = await synthesize(problemData, marketData, round1, round2);
    console.log(`✅ Done — Recommendation: ${synthesis.investment_recommendation}`);

    res.json({
      idea,
      stages: { problem: problemData, market: marketData, round1, round2, synthesis },
    });

  } catch (err) {
    console.error("❌ Pipeline error:", err.message);

    if (err.message?.includes("JSON")) {
      return res.status(500).json({ error: "AI returned malformed response. Try again." });
    }
    if (err.status === 401) {
      return res.status(500).json({ error: "Invalid API key. Check your GROQ_API_KEY in .env" });
    }

    res.status(500).json({ error: "Pipeline error. Please try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🟢 Server running on http://localhost:${PORT}`);
  console.log(`📡 POST /api/validate — body: { "idea": "your idea here" }`);
});
