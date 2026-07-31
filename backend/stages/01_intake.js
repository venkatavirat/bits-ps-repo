const { chat, parseJSON } = require("../groqClient");

async function extractProblem(rawIdea) {
  const text = await chat([
    {
      role: "user",
      content: `You are a startup analyst. Extract the core details from this startup idea.

Idea: "${rawIdea}"

Respond ONLY with a JSON object, no markdown, no explanation:
{
  "problem_statement": "the core problem being solved in one sentence",
  "target_user": "who specifically experiences this problem",
  "proposed_solution": "what the idea does about it",
  "key_assumptions": ["assumption 1", "assumption 2", "assumption 3"]
}`,
    },
  ]);

  return parseJSON(text);
}

module.exports = { extractProblem };
