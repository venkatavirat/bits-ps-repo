const { chat, parseJSON } = require("../groqClient");

async function researchMarket(problemData) {
  const text = await chat([
    {
      role: "user",
      content: `You are a market analyst. Give a grounded market analysis for this startup. Be specific — name real competitor categories.

Problem: ${problemData.problem_statement}
Target User: ${problemData.target_user}
Solution: ${problemData.proposed_solution}

Respond ONLY with a JSON object, no markdown, no explanation:
{
  "market_size": "estimated TAM with reasoning in 1-2 sentences",
  "market_trend": "growing/mature/declining and why in 1 sentence",
  "competitors": [
    { "name": "competitor name or category", "weakness": "their main gap" }
  ],
  "differentiation_gaps": ["gap 1", "gap 2", "gap 3"]
}`,
    },
  ]);

  return parseJSON(text);
}

module.exports = { researchMarket };
