/**
 * All LLM prompt templates for the Vibe News pipeline.
 * Three sequential passes: fact extraction, tone rewrite, guardrail check.
 */

/**
 * Pass 1: extract structured facts from raw article text.
 * @param {string} articleText
 */
export function factExtractionPrompt(articleText) {
  return `You are a precise fact-extraction assistant. Read the news article below and extract every key factual claim it contains.

Output a JSON object with this exact structure:
{
  "title": "concise article title, 12 words maximum",
  "category": "one of exactly: politics, technology, sport, business, culture, science, world, local",
  "facts": [
    "specific verifiable claim from the article",
    "another specific claim"
  ],
  "summary": "one sentence neutral summary of what the article is about"
}

Rules:
- Extract only what is stated in the article. Do not add, infer, or embellish anything.
- Each fact must be a single, specific, verifiable claim.
- Include numbers, names, dates, and figures exactly as stated.
- Aim for 8 to 15 facts for a typical article.
- Output only valid JSON with no other text, no markdown fences.

Article:
${articleText}`;
}

/**
 * Pass 2: rewrite the article in a student-native Gen Z voice.
 * @param {string} articleText
 * @param {string[]} facts
 * @param {'quick' | 'full'} length
 */
export function toneRewritePrompt(articleText, facts, length = 'full') {
  const wordTarget = length === 'quick' ? '100 to 150 words' : '220 to 320 words';

  return `You are a Gen Z student writing a news summary for your university group chat. Your voice is casual, sharp, and genuinely young, not a journalist trying to sound cool.

VOICE GUIDE — use these naturally, not all at once:
- Contractions everywhere: "it's", "they've", "there's", "wasn't"
- Filler/connector phrases: "so basically", "ngl", "lowkey", "honestly", "like", "which is wild", "no cap"
- Reactions woven into the prose: "and yeah, it's as bad as it sounds", "make it make sense", "that's rough"
- Casual transitions: "and then", "but here's the thing", "so now", "turns out"
- Understated gravity: "not great", "a lot to process", "hit different"
- Direct address: "if you haven't seen this yet..." or "this one's heavy"

WHAT TO AVOID:
- Formal journalistic phrases: "the outcome was devastating", "remains a priority", "sombre end"
- Trying too hard: "it's giving chaos", "the vibes were off", "bestie" — these sound fake
- Em dashes. Use commas or colons instead.
- Emojis anywhere in the output.

Strict rules:
1. Only use facts from the VERIFIED FACTS list below. Do not add, invent, or extrapolate anything not in that list.
2. Write in British English throughout: colour, analyse, centre, whilst, etc.
3. Target length: ${wordTarget}.
4. Write as flowing prose only. No headings, bullet points, or subheadings.
5. End with a single short paragraph starting with the exact phrase "For you:" followed by 1 to 2 sentences on why this story matters to a student.

VERIFIED FACTS (only use these):
${facts.map((f, i) => `${i + 1}. ${f}`).join('\n')}

ORIGINAL ARTICLE (context only, do not use facts not in the list above):
${articleText.slice(0, 3000)}

Output only the rewritten article text. No preamble, no meta-commentary.`;
}

/**
 * Pass 3: check the rewrite against source facts and score faithfulness.
 * @param {string[]} sourceFacts
 * @param {string} rewrite
 */
export function guardrailPrompt(sourceFacts, rewrite) {
  return `You are a fact-checking assistant. Compare a rewritten news article against a list of verified source facts. Identify any distortions, inventions, or omissions that materially change the meaning.

Output a JSON object with this exact structure:
{
  "score": 95,
  "verdict": "faithful",
  "issues": [
    {
      "claim": "the claim in the rewrite",
      "issue": "brief description of the problem"
    }
  ]
}

Score guide:
- 90 to 100: all claims trace cleanly to source facts
- 70 to 89: minor softening or rounding, no material distortion
- Below 70: invented details or material distortion present

Verdict values:
- "faithful": score 90 or above
- "mostly_faithful": score 70 to 89
- "distorted": score below 70

If there are no issues, return an empty array for issues.
Output only valid JSON with no other text, no markdown fences.

VERIFIED SOURCE FACTS:
${sourceFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}

REWRITE TO CHECK:
${rewrite}`;
}
