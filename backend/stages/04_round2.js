const { chat, parseJSON } = require("../groqClient");
const { PERSONAS } = require("./03_round1");

function formatOthersTakes(round1, excludePersona) {
  return Object.entries(round1)
    .filter(([key]) => key !== excludePersona)
    .map(([key, data]) => {
      const p = PERSONAS[key];
      return `${p.emoji} ${p.name}:
- Verdict: "${data.one_line_verdict}"
- Strengths they see: ${data.key_strengths.join("; ")}
- Concerns: ${data.key_concerns.join("; ")}
- Confidence: ${data.confidence_score}/10`;
    })
    .join("\n\n");
}

async function evaluateRound2(personaKey, problemData, round1) {
  const persona = PERSONAS[personaKey];
  const myTake = round1[personaKey];
  const othersTakes = formatOthersTakes(round1, personaKey);

  const text = await chat(
    [
      {
        role: "user",
        content: `You already evaluated this startup. Now you've seen what the other evaluators think. React to them — agree where you genuinely agree, push back where you don't. Be specific about who you're responding to. Stay in character.

THE STARTUP: ${problemData.problem_statement} — ${problemData.proposed_solution}

YOUR ORIGINAL TAKE:
- Verdict: "${myTake.one_line_verdict}"
- Confidence: ${myTake.confidence_score}/10

WHAT THE OTHERS SAID:
${othersTakes}

Respond ONLY with a JSON object, no markdown:
{
  "agreements": ["I agree with [name] that..."],
  "disagreements": ["I push back on [name]'s point about... because..."],
  "new_insight": "something the other perspectives made you realize",
  "revised_verdict": "your updated one-line take after hearing the others",
  "revised_confidence": 7
}`,
      },
    ],
    persona.systemPrompt
  );

  return { persona: personaKey, ...parseJSON(text) };
}

async function runRound2(problemData, round1) {
  const [vc, pm, customer] = await Promise.all([
    evaluateRound2("vc", problemData, round1),
    evaluateRound2("pm", problemData, round1),
    evaluateRound2("customer", problemData, round1),
  ]);

  return { vc, pm, customer };
}

module.exports = { runRound2 };
