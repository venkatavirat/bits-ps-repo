const { chat, parseJSON } = require("../groqClient");

const PERSONAS = {
  vc: {
    name: "Venture Capitalist",
    emoji: "🏦",
    color: "#6A60DD",
    systemPrompt: `You are a seasoned Venture Capitalist with 15 years of experience. You've seen thousands of pitches.
You care about: TAM, scalability, defensible moat, network effects, return potential.
You are direct, slightly impatient, speak in market multiples and growth rates.
You dismiss ideas with small TAM or weak defensibility. You get excited about network effects and data moats.
You do NOT care about nice UI or feel-good impact without a business model.`,
  },
  pm: {
    name: "Product Manager",
    emoji: "🛠️",
    color: "#0E8A6F",
    systemPrompt: `You are a Senior Product Manager with experience at startups and big tech.
You care about: can this be built, what's the MVP, who's the first customer, how do you measure success, execution risk.
You are structured and systematic. You speak in user stories, sprint cycles, and north star metrics.
You are skeptical of ideas that can't articulate a Day 1 feature set.
You do NOT care about total market size fantasy or vague answers.`,
  },
  customer: {
    name: "Target Customer",
    emoji: "👤",
    color: "#DC5B3F",
    systemPrompt: `You are the target customer this startup is trying to serve. You experience this problem firsthand.
You care about: does this solve MY problem, is the switching cost worth it, do I trust this company, how much does it cost.
You are blunt and emotional. You use concrete personal examples.
You are skeptical of solutions that feel tech-first rather than problem-first.
You do NOT care about the business model or TAM — only whether this makes your life better.`,
  },
};

async function evaluateRound1(personaKey, problemData, marketData) {
  const persona = PERSONAS[personaKey];

  const text = await chat(
    [
      {
        role: "user",
        content: `Evaluate this startup idea from your perspective. Be honest and stay in character.

PROBLEM: ${problemData.problem_statement}
TARGET USER: ${problemData.target_user}
SOLUTION: ${problemData.proposed_solution}
KEY ASSUMPTIONS: ${problemData.key_assumptions.join(", ")}

MARKET CONTEXT:
- Size: ${marketData.market_size}
- Trend: ${marketData.market_trend}
- Competitors: ${marketData.competitors.map((c) => c.name).join(", ")}
- Gaps: ${marketData.differentiation_gaps.join(", ")}

Respond ONLY with a JSON object, no markdown:
{
  "overall_sentiment": "excited/cautious/skeptical/negative",
  "key_strengths": ["strength 1", "strength 2"],
  "key_concerns": ["concern 1", "concern 2", "concern 3"],
  "one_line_verdict": "your single most important take in one punchy sentence",
  "confidence_score": 7
}`,
      },
    ],
    persona.systemPrompt
  );

  return { persona: personaKey, ...parseJSON(text) };
}

async function runRound1(problemData, marketData) {
  // Run all three in parallel
  const [vc, pm, customer] = await Promise.all([
    evaluateRound1("vc", problemData, marketData),
    evaluateRound1("pm", problemData, marketData),
    evaluateRound1("customer", problemData, marketData),
  ]);

  return { vc, pm, customer };
}

module.exports = { runRound1, PERSONAS };
