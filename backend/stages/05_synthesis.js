const { chat, parseJSON } = require("../groqClient");

async function synthesize(problemData, marketData, round1, round2) {
  const text = await chat([
    {
      role: "user",
      content: `You are a senior investment analyst. Synthesize this panel evaluation into a final report. The SWOT must come from the actual panel arguments — not generic startup advice.

THE STARTUP:
Problem: ${problemData.problem_statement}
Target User: ${problemData.target_user}
Solution: ${problemData.proposed_solution}

PANEL RESULTS:

VC Round 1: "${round1.vc.one_line_verdict}" (confidence: ${round1.vc.confidence_score}/10)
VC Round 2: "${round2.vc.revised_verdict}" (revised confidence: ${round2.vc.revised_confidence}/10)
VC strengths: ${round1.vc.key_strengths.join("; ")}
VC concerns: ${round1.vc.key_concerns.join("; ")}
VC disagreements: ${round2.vc.disagreements.join("; ")}

PM Round 1: "${round1.pm.one_line_verdict}" (confidence: ${round1.pm.confidence_score}/10)
PM Round 2: "${round2.pm.revised_verdict}" (revised confidence: ${round2.pm.revised_confidence}/10)
PM strengths: ${round1.pm.key_strengths.join("; ")}
PM concerns: ${round1.pm.key_concerns.join("; ")}
PM disagreements: ${round2.pm.disagreements.join("; ")}

Customer Round 1: "${round1.customer.one_line_verdict}" (confidence: ${round1.customer.confidence_score}/10)
Customer Round 2: "${round2.customer.revised_verdict}" (revised confidence: ${round2.customer.revised_confidence}/10)
Customer strengths: ${round1.customer.key_strengths.join("; ")}
Customer concerns: ${round1.customer.key_concerns.join("; ")}
Customer disagreements: ${round2.customer.disagreements.join("; ")}

Respond ONLY with a JSON object, no markdown:
{
  "swot": {
    "strengths": ["strength from panel arguments"],
    "weaknesses": ["weakness from panel arguments"],
    "opportunities": ["opportunity identified"],
    "threats": ["threat identified"]
  },
  "pitch_readiness_score": 72,
  "pitch_readiness_breakdown": {
    "market_timing": 80,
    "differentiation": 65,
    "execution_risk": 60,
    "founder_clarity": 75
  },
  "biggest_risk": "single most critical risk in one sentence",
  "investment_recommendation": "Strong Pass / Conditional Pass / Needs Rework / Pass",
  "recommendation_rationale": "2-3 sentences explaining the verdict based on panel discussion",
  "founder_action_plan": ["concrete next step 1", "concrete next step 2", "concrete next step 3"],
  "panel_consensus": "one sentence on what all three agreed on",
  "panel_tension": "one sentence on the biggest disagreement between evaluators"
}`,
    },
  ]);

  return parseJSON(text);
}

module.exports = { synthesize };
